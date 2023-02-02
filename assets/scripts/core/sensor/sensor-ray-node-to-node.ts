import { _decorator, Component, geometry, Node, PhysicsSystem, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('SensorRayNodeToNode')
export class SensorRayNodeToNode extends Component {

    @property(Node)
    startNode:Node | undefined

    @property(Node)
    endNode:Node | undefined

    @property([Number])
    masks = [];

    @property
    check_time = 0.5;

    _mask:number = 0;

    _time = 0;

    _direction = v3(0, 0, 0);

    _ray: geometry.Ray = new geometry.Ray();

    hitPoint = v3(0, 0, 0);

    start() {

        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];

    }

    update(deltaTime: number) {
        
        this._time -= deltaTime;
        if(this._time < 0) {
            UtilVec3.copy(this._ray.o, this.startNode!.worldPosition);
            UtilVec3.copy(this._direction, this.endNode!.worldPosition);
            this._direction.subtract(this.startNode!.worldPosition)
            const distance = this._direction.length();
            this._direction.normalize();
            UtilVec3.copy(this._ray.d, this._direction);

            if(PhysicsSystem.instance.raycastClosest(this._ray, this._mask, distance)) {
                UtilVec3.copy(this.hitPoint, PhysicsSystem.instance.raycastClosestResult.hitPoint);
            }else{
                UtilVec3.copy(this.hitPoint, Vec3.ZERO);
            }
        }

    }
}

