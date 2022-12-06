import { _decorator, Component, Node, PhysicsSystem, Vec3, geometry, debug, Graphics, RenderPipeline, v3 } from 'cc';
import { u3 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('SensorRaysAngle')
export class SensorRaysAngle extends Component {

    @property([Vec3])
    dir = [];

    @property(Number)
    angle = 30;

    @property(Number)
    segment = 10;

    @property([Vec3])
    origin = [];

    @property([Number])
    masks = [];

    @property
    check_time = 0.5;

    @property
    distance = 2;

    _ray: geometry.Ray = new geometry.Ray();

    checked = false;

    checkedNode = null;

    hitPoint:Vec3 = v3(0, 0, 0);

    _time = 0;

    _mask:number;

    _curDir = v3(0, 0, 0);

    _dirs: Array<Vec3>;
    _origins: Array<Vec3>;

    start() {
        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];

        this._dirs = new Array(this.dir.length * this.segment);
        this._origins = new Array(this.dir.length * this.segment);
        const each_angle = this.angle/this.segment;
        const rotationOrignl = v3(0, 0, 0);
        for(let i = 0; i < this.dir.length; i++) {
            const d = this.dir[i];
            let curAngle = -this.angle/2;
            for(let j = 0; j < this.segment; j++) {
                curAngle += each_angle;
                let newDir = v3(d.x, d.y, d.z);
                Vec3.rotateY(newDir, newDir, rotationOrignl, curAngle);
                const index = i * this.segment + j;
                this._dirs[index] = newDir;
                this._origins[index] = this.origin[i];
            }
        }

        console.log(this._dirs);
    }

    update(deltaTime: number) {
        this._time -= deltaTime;
        if(this._time < 0) {
            this._time = this.check_time; 
            for(let i = 0; i < this._dirs.length; i++) {
                if(this._dirs[i] == undefined) {
                    console.log(this._dirs[i]);
                }
                Vec3.transformMat4(this._curDir, this._dirs[i], this.node.worldMatrix);
                this._curDir = this._curDir.subtract(this.node.worldPosition).normalize();
                this._ray.d.x = this._curDir.x;
                this._ray.d.y = this._curDir.y;
                this._ray.d.z = this._curDir.z;
                this._ray.o.x = this._origins[i].x + this.node.worldPosition.x;
                this._ray.o.y = this._origins[i].y + this.node.worldPosition.y;
                this._ray.o.z = this._origins[i].z + this.node.worldPosition.z;
                if (PhysicsSystem.instance.raycastClosest(this._ray, this._mask, this.distance)) {
                    var res = PhysicsSystem.instance.raycastClosestResult;
                    u3.c(this.hitPoint, res.hitPoint);
                    this.checked = true;
                    this.checkedNode = res.collider.node;
                    return;
                }else{
                    this.checkedNode = null;
                    this.checked = false;
                }
            }
            
        }
    }
}

