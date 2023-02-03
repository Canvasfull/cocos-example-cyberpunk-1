import { _decorator, Component, Node, PhysicsSystem, Vec3, geometry, debug, Graphics, RenderPipeline, v3, math, Color, Quat, randomRangeInt } from 'cc';
import { Gizmo, UtilNode, UtilVec3 } from '../util/util';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('SensorRaysAngle')
@executeInEditMode
export class SensorRaysAngle extends Component {

    @property([Vec3])
    dir:Vec3[] = [];

    @property(Number)
    angle = 30;

    @property(Number)
    segment = 10;

    @property([Number])
    masks = [];

    @property
    check_time = 0.5;

    @property
    distance = 2;

    _ray: geometry.Ray = new geometry.Ray();

    checked = false;
    checkedNode:Node | undefined;

    hitPoint:Vec3 = v3(0, 0, 0);
    _time = 0;
    _mask = 0;
    _curDir = v3(0, 0, 0);
    _dirs: Array<Vec3> | undefined;

    hitStates: Array<boolean> | undefined;

    notHitCount = 0;

    onEnable() {

        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];

        const count = this.dir.length * this.segment;
        this._dirs = new Array(count);

        this.hitStates = new Array(count);
        const eachAngle = this.angle/this.segment;

        const rotationOrigins = v3(0, 0, 0);
        for(let i = 0; i < this.dir.length; i++) {
            const d = this.dir[i];
            let curAngle = -this.angle/2;
            for(let j = 0; j < this.segment; j++) {
                curAngle += eachAngle;
                let newDir = v3(d.x, d.y, d.z);
                Vec3.rotateY(newDir, newDir, rotationOrigins, math.toRadian(curAngle));
                const index = i * this.segment + j;
                this._dirs![index] = newDir;
            }
        }
    }

    update(deltaTime: number) {
        this._time -= deltaTime;
        if (this._time < 0) {
            this._time = this.check_time;
            UtilVec3.copy(this._ray.o, this.node.worldPosition);

            const worldEulerAngles = UtilNode.getWorldEulerAngles(this.node);
            const rotationY = math.toRadian(worldEulerAngles.y);

            for(let i = 0; i < this._dirs!.length; i++) {
                UtilVec3.copy(this._curDir, this._dirs![i]);

                Vec3.rotateY(this._curDir, this._curDir, Vec3.ZERO, rotationY);
                UtilVec3.copy(this._ray.d, this._curDir);

                if(EDITOR) {
                    const endPosition = v3(0, 0, 0);
                    const direction = v3(0, 0, 0);
                    UtilVec3.copy(direction, this._ray.d);
                    direction.multiplyScalar(this.distance);
                    UtilVec3.copy(endPosition, this._ray.o);
                    endPosition.add(direction);
                    endPosition.y = this.node.position.y;
                    Gizmo.drawLine(this._ray.o, endPosition, Color.YELLOW);
                }

                this.hitStates![i] = PhysicsSystem.instance.raycastClosest(this._ray, this._mask, this.distance);
                this.notHitCount = 0;
                if (this.hitStates![i]) {
                    var res = PhysicsSystem.instance.raycastClosestResult;
                    UtilVec3.copy(this.hitPoint, res.hitPoint);
                    this.checked = true;
                    this.checkedNode = res.collider.node;
                }else{
                    this.checkedNode = undefined;
                    this.checked = false;
                    this.notHitCount++;
                }
            }
        }
    }

    getRandomWalkableDirection():Vec3 | undefined {

        const randomIndex = randomRangeInt(0, this.notHitCount);

        // Find walkable direction index.
        let walkableIndex = -1;
        for(let i = 0; i < this.hitStates!.length; i++) {
            if(this.hitStates![i] == false) walkableIndex++;
            if(walkableIndex ===  randomIndex) break;
        }

        if(walkableIndex === -1) return undefined;

        this._curDir = this.dir[walkableIndex];

        const worldEulerAngles = UtilNode.getWorldEulerAngles(this.node);
        const rotationY = math.toRadian(worldEulerAngles.y);

        return Vec3.rotateY(this._curDir, this._curDir, Vec3.ZERO, rotationY);

    }
}

