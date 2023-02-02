import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../../util/util';
const { ccclass, property } = _decorator;

@ccclass('SteeringBehaviors')
export class SteeringBehaviors extends Component {

    moveVelocity = v3(0, 0, 0);
    desiredVelocity = v3(0, 0, 0);

    start() {

    }

    update(deltaTime: number) {
        
    }

    Seek(targetPos:Vec3) {
        UtilVec3.copy(this.desiredVelocity, targetPos);
        this.desiredVelocity.subtract(this.node.worldPosition);
        return this.desiredVelocity.subtract(this.moveVelocity);

    }
}

