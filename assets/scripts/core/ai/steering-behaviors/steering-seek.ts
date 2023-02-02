import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../../util/util';
import { SteeringBasic } from './steering-basic';
const { ccclass, property } = _decorator;

@ccclass('SteeringSeek')
export class SteeringSeek extends Component {

    moveVelocity = v3(0, 0, 0);
    desiredVelocity = v3(0, 0, 0);

    steeringBasic:SteeringBasic | undefined;

    start() {

        this.steeringBasic = this.getComponent(SteeringBasic)!;

    }

    update(deltaTime: number) {
        
    }

    SeekToward() {
        
    }

    Seek(targetPos:Vec3) {
        
        const target = this.steeringBasic?.target!;
        UtilVec3.copy(this.desiredVelocity, target.position);

        this.desiredVelocity.subtract(this.node.worldPosition);
        return this.desiredVelocity.subtract(this.moveVelocity);
    }
}

