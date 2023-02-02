import { _decorator, Component, Node } from 'cc';
import { ActorBrain } from '../../logic/actor/actor-brain';
const { ccclass, property } = _decorator;

@ccclass('test_move_target')
export class test_move_target extends Component {

    @property( { type:ActorBrain } )
    brain:ActorBrain | undefined;

    start() {

    }

    lateUpdate(deltaTime: number) {

        this.node.setWorldPosition(this.brain!.targetPosition);
        
    }
}

