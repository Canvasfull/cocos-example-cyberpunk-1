import { _decorator, Component, geometry, Node, PhysicsSystem, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('SensorSlope')
export class SensorSlope extends Component {

    @property([Number])
    masks = [];

    @property(Number)
    distance = 1;

    @property(Vec3)
    direction = v3(0, 0, 1);

    _mask:number = 0;
    _ray: geometry.Ray = new geometry.Ray();
    hitPoint = v3(0.5, 0, 0.5);

    @property(Vec3)
    vectorSlop = v3(0, 0, 0);

    start() {
        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];
    }

    checkSlope(direction:Vec3) {

        UtilVec3.copy(this.direction, direction);
        this.direction.y = 0;
        this.direction.normalize();

        UtilVec3.copy(this._ray.o, this.direction);
        this._ray.o.multiplyScalar(0.1);
        this._ray.o.add(this.node.worldPosition);
        this._ray.o.y += 0.3;
        this._ray.d.y = -1;
        this._ray.d.x = 0;
        this._ray.d.z = 0;
        
        if(PhysicsSystem.instance.raycastClosest(this._ray, this._mask, this.distance)) {
            UtilVec3.copy(this.hitPoint, PhysicsSystem.instance.raycastClosestResult.hitPoint);
            const heightDifference = Math.abs(this.hitPoint.y - this.node.worldPosition.y);
            if(heightDifference > 0.05){
                //console.log(heightDifference);
                UtilVec3.copy(this.vectorSlop, this.hitPoint);
                this.vectorSlop.subtract(this.node.worldPosition);
                return true;
            }
            return false;
        }else{
            UtilVec3.copy(this.hitPoint, Vec3.ZERO);
            UtilVec3.copy(this.vectorSlop, Vec3.ZERO);
            return false;
        }

    }
}

