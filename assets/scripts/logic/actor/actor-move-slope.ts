import { _decorator, Component, geometry, Node, PhysicsRayResult, PhysicsSystem, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('ActorMoveSlope')
export class ActorMoveSlope extends Component {

    ray = new geometry.Ray();
    mask = 0;

    distance = 0.4

    p0 = v3(0, 0, 0);
    p1 = v3(0, 0, 0);

    direction = v3(0, 0, 0);

    start() {
        this.mask =  1 << 3 | 1 << 4;
        UtilVec3.copy(this.ray.d, Vec3.ZERO);
        this.ray.d = v3(0, -1, 0);
        this.distance = 0.3;
    }

    updateSlope(moveDirection:Vec3):Vec3 {

        const moveLength = moveDirection.length();

        if(moveLength === 0) return Vec3.ZERO;

        UtilVec3.copy(this.ray.o, this.node.worldPosition);
        UtilVec3.copy(this.direction, moveDirection);

        if (PhysicsSystem.instance.raycastClosest(this.ray, this.mask, this.distance)) {
            const hit1 = PhysicsSystem.instance.raycastClosestResult;
            UtilVec3.copy(this.p0, hit1.hitPoint);
            this.ray.o.add(moveDirection.normalize().multiplyScalar(0.03));
            if (PhysicsSystem.instance.raycastClosest(this.ray, this.mask, this.distance)) { 
                const hit2 = PhysicsSystem.instance.raycastClosestResult;
                UtilVec3.copy(this.direction, hit2.hitPoint);
                this.direction.subtract(this.p0).normalize().multiplyScalar(moveLength);
            }
        }

        return this.direction;

    }
}

