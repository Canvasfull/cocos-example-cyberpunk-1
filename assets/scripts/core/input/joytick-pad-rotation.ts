import { _decorator, Component, Node, Input, EventTouch, game } from 'cc';
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

        const x = event.getDeltaX();
        const y = event.getDeltaY();

        const screenXRate = x / game.canvas!.width;
        const screenYRate = y / game.canvas!.height;

        const rotateX = 180 * screenXRate * screenXRate;
        const rotateY = 180 * screenYRate * screenXRate;

        this._input?.onRotation(rotateX, rotateY);//event.getDeltaX(), event.getDeltaY());
    }

}

