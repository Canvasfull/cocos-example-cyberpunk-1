import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode } from 'cc';
import { ActorAnimationGraphGroup } from '../logic/actor/actor-animation-graph-group';
const { ccclass, property } = _decorator;

@ccclass('TestAnimationGraph')
export class TestAnimationGraph extends Component {

    _animationGraph:ActorAnimationGraphGroup | undefined;

    start() {

        const view = this.node.getChildByName('view');
        this._animationGraph = view.addComponent(ActorAnimationGraphGroup);
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);

    }

    keyDown(event: EventKeyboard) {

        if(event.keyCode === KeyCode.KEY_D) {
            this._animationGraph?.play('trigger_draw', true);
        }

        if (event.keyCode === KeyCode.KEY_F) {
            this._animationGraph?.play('trigger_fire', true);
        }

        if (event.keyCode === KeyCode.KEY_R) {
            this._animationGraph?.play('trigger_reload', true);
        }

        if (event.keyCode === KeyCode.KEY_E) {
            this._animationGraph?.play('trigger_reload_empty', true);
        }

        if (event.keyCode === KeyCode.KEY_H) {
            this._animationGraph?.play('trigger_holster', true);
        }
        
    }

    update(deltaTime: number) {
        
    }
}

