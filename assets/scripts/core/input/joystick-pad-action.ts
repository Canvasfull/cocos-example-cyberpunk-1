import { _decorator, Component, Node, Input, EventTouch } from 'cc';
import { Msg } from '../msg/msg';
import { InputJoystick } from './input-joystick';
const { ccclass, property } = _decorator;

@ccclass('JoystickPadAction')
export class JoystickPadAction extends Component {

    _input:InputJoystick | undefined;

    start() {
        this._input = this.node.parent!.getComponent(InputJoystick)!;
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

