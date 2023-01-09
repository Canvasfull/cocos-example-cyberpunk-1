import { _decorator, Component, geometry, Node, PhysicsRayResult, PhysicsSystem } from 'cc';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorMoveSlope')
export class ActorMoveSlope extends Component {

    @property(Actor)
    actor:Actor | undefined;

    ray = new geometry.Ray();

    mask = 0;

    distance = 0.4

    start() {

        this.mask =  1 << 1;

    }

    update(deltaTime: number) {

        if (PhysicsSystem.instance.raycastClosest(this.ray, this.mask, this.distance)) {
            const hit = PhysicsSystem.instance.raycastClosestResult;
            if(hit.hitNormal !== this.node.up) {
                this.actor!.isSlope = true;
            }
        }

    }
}

