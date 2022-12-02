import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode } from 'cc';
import { ActorAnimationGraphGroup } from '../logic/actor/actor-animation-graph-group';
const { ccclass, property } = _decorator;

@ccclass('test_anig')
export class test_anig extends Component {

    _animg:ActorAnimationGraphGroup;

    start() {

        const view = this.node.getChildByName('view');

        this._animg = view.addComponent(ActorAnimationGraphGroup);


        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);

    }

    keyDown(event: EventKeyboard) {

        if(event.keyCode == KeyCode.KEY_F) {
            this._animg.play('trigger_fire', true);
        }

        if(event.keyCode == KeyCode.KEY_R) {
            this._animg.play('trigger_reload', true);
        }

        if(event.keyCode == KeyCode.KEY_E) {
            this._animg.play('trigger_reload_empty', true);
        }

        if(event.keyCode == KeyCode.KEY_H) {
            this._animg.play('trigger_holster', true);
        }
        
    }

    update(deltaTime: number) {
        
    }
}

