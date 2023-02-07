import { _decorator, Component, EventKeyboard, EventTouch, Input, input, KeyCode, Node } from 'cc';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('InputEquipSelect')
export class InputEquipSelect extends Component {
    
    start() {
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onTouchMove(event: EventTouch) {
        Msg.emit('msg_select_equip', event.getDelta());
    }

    onKeyUp(event: EventKeyboard) {

        if (event.keyCode === KeyCode.KEY_Q) {
            Msg.emit('back');
        }

    }

    update(deltaTime: number) {
        
    }
}

