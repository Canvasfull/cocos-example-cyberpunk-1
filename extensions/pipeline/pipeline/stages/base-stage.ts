import { director, game, gfx, Material, PipelineStateManager, renderer, RenderStage, RenderTexture, Vec2, _decorator, pipeline, Enum, Node, ForwardStage, rendering } from 'cc';
import { getCameraUniqueID, getQuadIA } from '../utils/utils';
import { UBOBase } from '../ubo';
import { loadResource } from '../utils/npm';

const { ccclass, type, property } = _decorator;

const MaterialResourceDir = 'pipeline/materials/';

class UBOBaseStage extends UBOBase {
    static TextureSize = this.increaseIndex(4);
}

export enum InputType {
    LastStageOutput,
    CameraColorTexture,
    CameraDepthTexture,
    TargetStageOutput,
};
Enum(InputType)

let _BaseStageID = 0

@ccclass('BaseStage')
export class BaseStage {
    static outputMap: Map<string, RenderTexture> = new Map
    static stages: Map<string, BaseStage> = new Map
    static forwardStage: ForwardStage | undefined;

    _id = 0
    constructor () {
        this._id = _BaseStageID++;
    }

    _name = 'BaseStage';

    // auto load material name
    _materialName = 'blit-screen';
    get materialName () {
        return this._materialName;
    }
    set materialName (v) {
        if (v !== this._materialName) {
            this.loadMaterial();
        }

        this._materialName = v;
    }

    loadMaterial () {
        loadResource(MaterialResourceDir + this.materialName, (m: Material) => {
            this.material = m;
        });
    }

    @type(Material)
    _material: Material | undefined
    @type(Material)
    get material () {
        return this._material;
    }
    set material (v) {
        this._material = v;
    }

    @property
    shadingScale = 1;

    @property
    customSize = new Vec2(1024, 1024);

    @type(InputType)
    inputType = InputType.LastStageOutput;

    @property(String)
    outputNames = []

    @type(Node)
    targetStageNode: Node;

    useCustomSize = false;
    renderToScreen = false;

    rtCount = 1;
    renderTextures: RenderTexture[] = [];

    protected _rect = new gfx.Rect(0, 0, 1, 1);
    clearColors = [new gfx.Color(0, 0, 0, 1)];

    textureFormat = gfx.Format.RGBA8;

    requestDepth = false;

    lastStage: BaseStage | undefined;

    uniqueStage = false
    slotName (camera: renderer.scene.Camera, index = 0) {
        let name = this.outputNames[index] || this._name
        if (this.uniqueStage) {
            return name
        }
        return `${name}_${this._id}_${getCameraUniqueID(camera)}`
    }

    finalShadingScale () {
        return this.shadingScale * director.root.pipeline.pipelineSceneData.shadingScale;
    }

    protected _finalShadingSize = new Vec2;
    finalShadingSize (camera: renderer.scene.Camera) {
        let shadingScale = this.finalShadingScale();

        let width = game.canvas!.width;
        let height = game.canvas!.height;

        if (this.useCustomSize) {
            width = this.customSize.x;
            height = this.customSize.y;
        }

        this._finalShadingSize.set(
            Math.floor(width * shadingScale),
            Math.floor(height * shadingScale)
        )

        return this._finalShadingSize;
    }

    destroy () {

    }

    get outputTexture (): RenderTexture | null {
        return null
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline) {

    }
}
