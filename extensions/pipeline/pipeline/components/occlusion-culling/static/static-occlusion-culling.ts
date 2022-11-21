import { Camera, Component, director, geometry, gfx, MeshRenderer, Node, Quat, renderer, Vec2, Vec3, _decorator, ccenum, Color, GeometryRenderer, Mat4 } from 'cc';
import { EDITOR } from 'cc/env';
import { Pool } from './utils/pool';
import raycast from './utils/raycast';
import raycastGpu from './utils/raycast-gpu';
import { StaticOcclusionArea } from './static-occlusion-area';
import { CullingBlock } from './static-occlusion-block';
import { modelPoints, sphereDirections } from './utils/utils';
import { CameraSetting } from '../../../camera-setting';

const { ccclass, property, type, executeInEditMode } = _decorator;

let _tempOBB = new geometry.OBB();
let _tempRay = new geometry.Ray();

let _cornerResults: Map<string, renderer.scene.Model[]> = new Map

enum CornerType {
    Center,
    Corner8_Center,
    Seprate_Corner8_Center,
}
ccenum(CornerType);

@ccclass('sync.StaticOcclusionCulling')
@executeInEditMode
export class StaticOcclusionCulling extends Component {
    static instance: StaticOcclusionCulling | undefined;

    @type(Node)
    root: Node | null = null;

    @type(Camera)
    camera: Camera | null = null;

    @property
    _blockSize = 3;
    @property
    get blockSize () {
        return this._blockSize;
    }
    set blockSize (v) {
        this._blockSize = v;
        this.initBlocks();
    }

    @property({ visible: false })
    modelNames: string[] = []

    @property
    rendererCount = 0;

    @property
    get bake () {
        return false;
    }
    set bake (v) {
        this._startBake();
    }

    @property
    get stop () {
        return false;
    }
    set stop (v) {
        this._isBaking = false;
    }

    @property
    shouldFastBack = false;

    @property
    sphereBakeCount = 6000;

    @property
    renderBlocks = false;
    @property
    renderRaycast = false;
    @property
    renderRaycastLength = 3;

    @property
    _enabledCulling = true;
    @property
    get enabledCulling () {
        return this._enabledCulling;
    }
    set enabledCulling (v) {
        this._enabledCulling = v;

        if (!v) {
            let renderers = this.renderers;
            for (let i = 0; i < renderers.length; i++) {
                renderers[i].model!.enabled = true;
            }
        }

        this._lastLocatedBlock = null;
    }
    @property
    useGpu = true;

    _cornerType = CornerType.Corner8_Center;
    @type(CornerType)
    get cornerType () {
        return this._cornerType;
    }
    set cornerType (v) {
        this._cornerType = v;
        this._gpuKernelDirty = true;
    }

    renderers: MeshRenderer[] = []
    models: renderer.scene.Model[] = []

    _loadCompeleted = false;
    _currentLocatedBlock: CullingBlock | null = null
    _lastLocatedBlock: CullingBlock | null = null

    areas: StaticOcclusionArea[] = []
    _updateAreas () {
        this.areas = this.getComponentsInChildren(StaticOcclusionArea);
        for (let i = 0; i < this.areas.length; i++) {
            this.areas[i].culling = this;
        }
    }

    onEnable () {
        StaticOcclusionCulling.instance = this;
    }

    onDisable () {
        let renderers = this.renderers;
        for (let i = 0; i < renderers.length; i++) {
            renderers[i].model!.enabled = true;
        }
        this._lastLocatedBlock = null;

        if (StaticOcclusionCulling.instance === this) {
            StaticOcclusionCulling.instance = undefined;
        }
    }

    start () {
        this._init();
    }
    _init () {
        this._updateAreas();

        if (this.root) {
            this.renderers = this.root!.getComponentsInChildren(MeshRenderer);
            this.renderers = this.renderers.filter(r => r.enabledInHierarchy);
            this.models = this.renderers.map(r => r.model!);

            let map: Map<string, MeshRenderer> = new Map
            this.renderers.forEach(r => {
                map.set(r.node.name, r);
            })

            let modelNames = this.modelNames;
            this.areas.forEach(area => {
                area.blocks.forEach(block => {
                    block.renderers = block.modelIndices.map(index => map.get(modelNames[index])!)
                })
            })

        }

        this._loadCompeleted = true;
    }

    calcCulling () {
        if (!this.camera || !this._loadCompeleted || this._isBaking) {
            return
        }

        this._currentLocatedBlock = null;

        let blockSize = this.blockSize;
        let worldPos = this.camera.node.worldPosition;
        let areas = this.areas;
        for (let i = 0; i < areas.length; i++) {
            let area = areas[i];
            _tempOBB.center.set(area.node.worldPosition);
            let worldScale = area.node.getWorldScale();
            _tempOBB.halfExtents.set(worldScale.x / 2, worldScale.y / 2, worldScale.z / 2);

            if (!geometry.intersect.obbPoint(_tempOBB, worldPos as Vec3)) {
                continue;
            }

            let x = Math.floor((worldPos.x - (_tempOBB.center.x - _tempOBB.halfExtents.x)) / blockSize);
            let y = Math.floor((worldPos.y - (_tempOBB.center.y - _tempOBB.halfExtents.y)) / blockSize);
            let z = Math.floor((worldPos.z - (_tempOBB.center.z - _tempOBB.halfExtents.z)) / blockSize);

            let xCount = Math.floor(worldScale.x / blockSize);
            let yCount = Math.floor(worldScale.y / blockSize);
            let zCount = Math.floor(worldScale.z / blockSize);

            let blocks = area.blocks;
            let index = x * yCount * zCount + y * zCount + z;
            let block = blocks[index];
            if (!block) {
                continue;
            }

            this._currentLocatedBlock = block;

            break;
        }

        if (this._lastLocatedBlock === this._currentLocatedBlock) {
            return;
        }

        let renderers = this.renderers;
        if (!this._currentLocatedBlock) {
            for (let i = 0; i < renderers.length; i++) {
                let model = renderers[i] && renderers[i].model;
                if (model) {
                    model.enabled = true;
                }
            }
        }
        else {
            let block = this._currentLocatedBlock;

            for (let i = 0; i < renderers.length; i++) {
                let model = renderers[i].model;
                if (model) {
                    model.enabled = false;
                }
            }
            for (let i = 0; i < block.renderers.length; i++) {
                let model = block.renderers[i] && block.renderers[i].model;
                if (model) {
                    model.enabled = true;
                }
            }
        }

        this._lastLocatedBlock = this._currentLocatedBlock;
    }

    update () {
        this._updateAreas();

        if (this._enabledCulling) {
            this.calcCulling();
        }

        if (EDITOR) {
            if (this._isBaking) {
                this._bake();
            }
            if (this.renderBlocks) {
                this.debugDraw();
            }
        }
    }

    _isBaking = false;
    _bakingAreaIndex = 0;
    _bakingAreaEndIndex = 0;
    _bakingBlockIndex = new Vec3;
    _bakingDirections: Vec3[] = [];

    @property
    _maxDirectionsOneFrame = 10000;
    @property
    get maxDirectionsOneFrame () {
        return this._maxDirectionsOneFrame;
    }
    set maxDirectionsOneFrame (v) {
        this._maxDirectionsOneFrame = v;
        this._gpuKernelDirty = true;
    }

    @property
    _maxModelCount = 10000;
    @property
    get maxModelCount () {
        return this._maxModelCount;
    }
    set maxModelCount (v) {
        this._maxModelCount = v;
        this._gpuKernelDirty = true;
    }

    @property
    _modelRange = new Vec2(0, 100000);
    @property
    get modelRange () {
        return this._modelRange;
    }
    set modelRange (v) {
        this._modelRange = v;
        this._gpuKernelDirty = true;
    }

    _gpuKernelDirty = true;

    _startTime = 0;

    _startBake (areaStartIndex = 0, areaEndIndex = Infinity) {
        if (this._isBaking) {
            return;
        }

        this._startTime = Date.now();

        _cornerResults.clear();

        this._isBaking = true;
        this._bakingAreaIndex = areaStartIndex;
        this._bakingAreaEndIndex = Math.min(areaEndIndex, this.areas.length);
        this._bakingBlockIndex = new Vec3;

        this.renderers = this.root!.getComponentsInChildren(MeshRenderer);
        this.renderers = this.renderers.filter(r => {
            return r.enabledInHierarchy;
        });

        this.models = this.renderers.map(r => r.model!);
        this.modelNames = this.renderers.map(r => r.node.name);

        let newArray = []
        for (let i = Math.max(0, this._modelRange.x), l = Math.min(this._modelRange.y, this.models.length); i < l; i++) {
            newArray.push(this.models[i]);
        }
        this.models = newArray;
        this.models.length = Math.min(this.models.length, this.maxModelCount);
        this.rendererCount = this.renderers.length;

        for (let i = this._bakingAreaIndex; i < this._bakingAreaEndIndex; i++) {
            this.areas[i].initBlocks();

        }

        console.log('--------------------------------');


        console.time('create bakingDirections')

        if (this.shouldFastBack) {
            this._bakingDirections = sphereDirections(this.sphereBakeCount);
        }
        else {
            this._bakingDirections = modelPoints(this.models);
        }

        console.timeEnd('create bakingDirections')

        if (this.useGpu) {
            console.time('raycastGpu.createKernel')

            let cornersCount = 1;
            if (this._cornerType === CornerType.Corner8_Center) {
                cornersCount = 2 * 2 * 2 + 1
            }

            if (this._gpuKernelDirty) {
                let maxDirectionsOneFrame = Math.min(this.maxDirectionsOneFrame, this._bakingDirections.length);
                raycastGpu.createKernel(this.models, maxDirectionsOneFrame, cornersCount);
                this._gpuKernelDirty = false;
            }

            console.timeEnd('raycastGpu.createKernel')
        }
    }

    initBlocks () {
        for (let i = 0; i < this.areas.length; i++) {
            let area = this.areas[i];
            area.initBlocks();
        }
    }

    _bake () {
        if (!this.root) {
            return;
        }


        if (EDITOR) {
            setTimeout(() => {
                (window as any).cce.Engine.repaintInEditMode();
            }, 0)
        }

        const maxBakeBlockCountPerFrame = 1;
        let bakedBlockCount = 0;

        let blockSize = this.blockSize;
        let halfBlockSize = blockSize / 2;
        for (let i = this._bakingAreaIndex; i < this._bakingAreaEndIndex;) {
            let area = this.areas[i];
            let blocks = area.blocks;

            let xCount = area.blockCells.x;
            let yCount = area.blockCells.y;
            let zCount = area.blockCells.z;

            let totalCount = area.blockCount;

            for (let x = this._bakingBlockIndex.x; x < xCount;) {
                for (let y = this._bakingBlockIndex.y; y < yCount;) {
                    for (let z = this._bakingBlockIndex.z; z < zCount;) {
                        if (bakedBlockCount >= maxBakeBlockCountPerFrame) {
                            return;
                        }

                        let index = x * yCount * zCount + y * zCount + z;

                        let block = blocks[index];

                        if (!block.bakingProcess) {
                            block.bakingDirections = this._bakingDirections.concat();
                            block.bakingTotalCount = block.bakingDirections.length;
                        }

                        console.time('do raycasting')

                        let directions = block.bakingDirections.splice(0, this.maxDirectionsOneFrame);
                        if (this.shouldFastBack) {
                            this._raycastDirections(block, directions);
                        }
                        else {
                            this._raycastPoints(block, directions);
                        }

                        console.timeEnd('do raycasting')

                        let totalProcess = (index + block.bakingProcess) / totalCount;
                        console.log(`baking process : block - ${block.bakingProcess}, total - ${totalProcess}`)

                        let costTime = (Date.now() - this._startTime) / 1000;
                        let leftTime = (costTime / totalProcess) * (1 - totalProcess);
                        console.log(`left time : ${leftTime} s`)

                        // recycle
                        for (let i = 0; i < directions.length; i++) {
                            Pool.Vec3.put(directions[i]);
                        }

                        if (block.bakingDirections.length) {
                            return;
                        }

                        this._bakingBlockIndex.z = ++z;
                        bakedBlockCount++;
                    }
                    this._bakingBlockIndex.z = 0;
                    this._bakingBlockIndex.y = ++y;
                }
                this._bakingBlockIndex.y = 0;
                this._bakingBlockIndex.z = 0;
                this._bakingBlockIndex.x = ++x;
            }

            this._bakingAreaIndex = ++i;
            this._bakingBlockIndex.set(0, 0, 0);
        }

        this._isBaking = false;

        console.log(`bake static culling : ${(Date.now() - this._startTime) / 1000} s`)
    }

    _raycastDirections (block: CullingBlock, directions: Vec3[]) {
        let models = this.models;

        _tempRay.o.set(block.center);
        for (let i = 0; i < directions.length; i++) {
            _tempRay.d.set(directions[i]);
            let results = raycast.raycastModels(models, _tempRay, undefined, undefined, true);
            if (results.length > 0) {
                let r = results[0].node.getComponent(MeshRenderer)!;
                if (r && block.renderers.indexOf(r) === -1) {
                    block.renderers.push(r);
                }
            }
        }

        block.modelIndices = block.renderers.map(r => {
            return this.models.indexOf(r.model!);
        })
    }

    _forEachCorner (block: CullingBlock, func: Function) {
        let corners: Vec3[] = [block.center];
        for (let x = -1; x <= 1; x += 2) {
            for (let y = -1; y <= 1; y += 2) {
                for (let z = -1; z <= 1; z += 2) {
                    corners.push(new Vec3(block.center).add3f(block.halfExtents.x * x, block.halfExtents.y * y, block.halfExtents.z * z));
                }
            }
        }

        for (let i = 0; i < corners.length; i++) {
            func(corners[i]);
        }
    }

    _raycastPoints (block: CullingBlock, points: Vec3[]) {
        let models = this.models;

        let corners: Vec3[] = [block.center];
        if (this._cornerType === CornerType.Corner8_Center || this._cornerType === CornerType.Seprate_Corner8_Center) {
            for (let x = -1; x <= 1; x += 2) {
                for (let y = -1; y <= 1; y += 2) {
                    for (let z = -1; z <= 1; z += 2) {
                        corners.push(new Vec3(block.center).add3f(block.halfExtents.x * x, block.halfExtents.y * y, block.halfExtents.z * z));
                    }
                }
            }
        }

        if (!this.useGpu) {
            for (let i = 0; i < corners.length; i++) {
                for (let j = 0; j < points.length; j++) {
                    _tempRay.o.set(corners[i]);
                    (_tempRay.d.set(points[j]) as Vec3).subtract(_tempRay.o).normalize();

                    let results = raycast.raycastModels(models, _tempRay, undefined, undefined, true);

                    if (results.length > 0) {
                        let r = results[0].node.getComponent(MeshRenderer)!;
                        if (r && block.renderers.indexOf(r) === -1) {
                            block.renderers.push(r);
                        }
                    }
                }
            }
        }
        else {
            if (this._cornerType === CornerType.Seprate_Corner8_Center) {
                for (let i = 0; i < corners.length; i++) {
                    let corner = corners[i];
                    let key = `${corner.x}_${corner.y}_${corner.z}`;
                    let bakedResults = _cornerResults.get(key);

                    let finalResults: renderer.scene.Model[]
                    if (!bakedResults || !(bakedResults as any)._baked) {
                        if (!bakedResults) {
                            bakedResults = [];
                            _cornerResults.set(key, bakedResults);
                        }
                        if (block.bakingProcess >= 1) {
                            (bakedResults as any)._baked = true;
                        }
                        finalResults = raycastGpu.raycastModels(models, [corner], points);
                        for (let i = 0; i < finalResults.length; i++) {
                            if (bakedResults!.indexOf(finalResults[i]) === -1) {
                                bakedResults!.push(finalResults[i]);
                            }
                        }
                    }
                    else {
                        finalResults = bakedResults;
                    }
                    finalResults.forEach(m => {
                        let r = m.node.getComponent(MeshRenderer);
                        if (r && block.renderers.indexOf(r) === -1) {
                            block.renderers.push(r);
                        }
                    })
                }
            }
            else {
                let finalResults = raycastGpu.raycastModels(models, corners, points);
                finalResults.forEach(m => {
                    let r = m.node.getComponent(MeshRenderer);
                    if (r && block.renderers.indexOf(r) === -1) {
                        block.renderers.push(r);
                    }
                })
            }
        }

        block.modelIndices = block.renderers.map(r => {
            return this.models.indexOf(r.model!);
        })
    }

    debugDraw () {
        let camera;
        if (EDITOR) {
            director.root.scenes.forEach(s => {
                s.cameras.forEach(c => {
                    if (c.name === 'Editor UIGizmoCamera') {
                        camera = c;
                    }
                })
            })
        }
        else {
            camera = CameraSetting.mainCamera && CameraSetting.mainCamera.camera;
        }

        if (camera) {
            camera.initGeometryRenderer();
        }
        let geometryRenderer: GeometryRenderer = camera && camera.geometryRenderer || director.root.pipeline.geometryRenderer;
        if (!geometryRenderer) {
            return;
        }

        let areaColor = new Color(0, 0, 0, 100);
        let blockColor = new Color(255, 0, 0, 20);
        let locateBlockColor = new Color(0, 0, 255, 20);
        let tempMatrix = new Mat4();
        let identityAABB = new geometry.AABB(0, 0, 0, 0.5, 0.5, 0.5);

        for (let i = 0; i < this.areas.length; i++) {
            let area = this.areas[i];
            geometryRenderer.addBoundingBox(identityAABB, areaColor, false, false, undefined, true, area.node.worldMatrix);
        }

        // this.areas.forEach(area => {
        //     let blocks = area.blocks;
        //     for (let i = 0; i < blocks.length; i++) {
        //         let block = blocks[i];

        //         let tempScale = Pool.Vec3.get().set(block.halfExtents.x * 2, block.halfExtents.y * 2, block.halfExtents.z * 2 * block.bakingProcess);
        //         tempMatrix.fromRTS(Quat.IDENTITY as Quat, block.center as Vec3, tempScale);
        //         Pool.Vec3.put(tempScale);

        //         let color = blockColor;
        //         if (block === this._currentLocatedBlock) {
        //             color = locateBlockColor;
        //         }

        //         geometryRenderer.addBoundingBox(identityAABB, color, false, false, undefined, true, tempMatrix);

        //         // if (this.renderRaycast /*&& block === this._currentLocatedBlock*/) {
        //         //     drawer.type = DrawType.Line;
        //         //     drawer.matrix.fromRTS(Quat.IDENTITY as Quat, Vec3.ZERO as Vec3, Vec3.ONE as Vec3);

        //         //     let lines: Vec3[][] = []
        //         //     if (this.shouldFastBack) {
        //         //         let directions = sphereDirections(this.sphereBakeCount)
        //         //         for (let i = 0; i < directions.length; i++) {
        //         //             directions[i].multiplyScalar(this.renderRaycastLength).add(block.center)
        //         //             lines.push([block.center, directions[i]])
        //         //         }
        //         //     }
        //         //     else {
        //         //         let corners: Vec3[] = [block.center];
        //         //         // for (let x = -1; x <= 1; x += 2) {
        //         //         //     for (let y = -1; y <= 1; y += 2) {
        //         //         //         for (let z = -1; z <= 1; z += 2) {
        //         //         //             corners.push(new Vec3(block.center).add3f(block.halfExtents.x * x, block.halfExtents.y * y, block.halfExtents.z * z));
        //         //         //         }
        //         //         //     }
        //         //         // }

        //         //         if (!this.useGpu) {
        //         //             for (let i = 0; i < corners.length; i++) {
        //         //                 let points = modelPoints(this.models);
        //         //                 points.forEach(p => {
        //         //                     lines.push([corners[i], p])
        //         //                 })
        //         //             }
        //         //         }
        //         //         else {
        //         //             // let results = raycastGpu.raycastModels(models, corners, points);
        //         //             // results.forEach(m => {
        //         //             //     let r = m.node.getComponent(MeshRenderer);
        //         //             //     if (r && block.renderers.indexOf(r) === -1) {
        //         //             //         block.renderers.push(r);
        //         //             //     }
        //         //             // })
        //         //         }
        //         //     }

        //         //     drawer.line(...lines)
        //         // }
        //     }
        // })
    }
}
