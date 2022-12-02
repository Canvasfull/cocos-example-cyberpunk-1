import { _decorator, Component, Node, Input, EventTouch } from 'cc';
import { Msg } from '../msg/msg';
import { input_joystick } from './input-joystick';
const { ccclass, property } = _decorator;

@ccclass('joystick_pad')
export class joystick_pad extends Component {

    _input:input_joystick;

    start() {
        //bind input joystick
        this._input = this.node.parent.getComponent(input_joystick);
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart(event: EventTouch) {
        this._input?.onStart();
    }

    onTouchEnd(event: EventTouch) {
        this._input?.onEnd();
    } 

    onTouchCancel(event: EventTouch) {
        this._input?.onEnd();
    }

}

