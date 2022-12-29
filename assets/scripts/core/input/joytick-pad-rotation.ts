import { _decorator, Component, Node, Input, EventTouch } from 'cc';
import { Msg } from '../msg/msg';
import { InputJoystick } from './input-joystick';
const { ccclass, property } = _decorator;

@ccclass('JoystickPadRotation')
export class JoystickPadRotation extends Component {

    _input:InputJoystick | undefined;

    start() {
        this._input = this.node.parent!.getComponent(InputJoystick)!;
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onTouchMove(event: EventTouch) {
        this._input?.onRotation(event.getDeltaX(), event.getDeltaY());
    }

}

