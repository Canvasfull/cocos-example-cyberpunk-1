import { _decorator, Component, Node, PhysicsSystem, Vec3, geometry, debug, Graphics, RenderPipeline, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('sensor_rays')
export class sensor_rays extends Component {

    @property([Vec3])
    dir = []

    @property([Vec3])
    origin = []

    @property([Number])
    masks = [];

    @property
    check_time = 0.5;

    @property
    distance = 2;

    _ray: geometry.Ray = new geometry.Ray();

    checked = false;

    checkedNode = null;

    _time = 0;

    _mask:number;

    _curdir = v3(0, 0, 0);

    start() {
        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];
    }

    update(deltaTime: number) {
        this._time -= deltaTime;
        if(this._time < 0) {
            this._time = this.check_time;
            
            for(let i = 0; i < this.dir.length; i++) {

                Vec3.transformMat4(this._curdir, this.dir[i], this.node.worldMatrix);
                this._curdir = this._curdir.subtract(this.node.worldPosition).normalize();
                //console.log(this.dir[i], this._curdir, this.node.forward);
                this._ray.d.x = this._curdir.x;//this.node.forward.x;//this.dir[i].x;
                this._ray.d.y = this._curdir.y;//this.node.forward.y;//this.dir[i].y;
                this._ray.d.z = this._curdir.z;//this.node.forward.z;//this.dir[i].z;

                this._ray.o.x = this.origin[i].x + this.node.worldPosition.x;
                this._ray.o.y = this.origin[i].y + this.node.worldPosition.y;
                this._ray.o.z = this.origin[i].z + this.node.worldPosition.z;

                if (PhysicsSystem.instance.raycastClosest(this._ray, this._mask, this.distance)) {
                    var res = PhysicsSystem.instance.raycastClosestResult;
                    this.checked = true;
                    this.checkedNode = res.collider.node;
                    return;
                }else{
                    this.checkedNode = null;
                }
            }
            this.checked = false;
        }
    }
}

