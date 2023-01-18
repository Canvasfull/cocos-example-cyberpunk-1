import { _decorator, Component, math, Node, v3 } from 'cc';
import { UtilVec3 } from '../../core/util/util';
import { ActorMove } from '../actor/actor-move';
const { ccclass, property } = _decorator;

@ccclass('CameraTps')
export class CameraTps extends Component {

    @property(Node)
    rotationNode:Node | undefined;

    @property({type: ActorMove, tooltip:'Test actor move.'})
    actorMove:ActorMove | undefined;

    @property(Number)
    smoothAngle = 20;

    targetAngle = v3(0, 0, 0);
    currentAngle = v3(0, 0, 0);

    start() {
        UtilVec3.copy(this.targetAngle, this.rotationNode!.eulerAngles);
        UtilVec3.copy(this.currentAngle, this.targetAngle);
    }

    update(deltaTime: number) {

        this.rotationX(this.actorMove!.angleVertical);

        this.currentAngle.x = math.lerp(this.currentAngle.x, this.targetAngle.x, this.smoothAngle * deltaTime);

        this.rotationNode?.setRotationFromEuler(this.currentAngle);
        
    }

    rotationX(angleX:number) {

        this.targetAngle.x = angleX;

    }
}

