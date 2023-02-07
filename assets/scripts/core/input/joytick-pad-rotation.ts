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

        const rotateX = 360 * screenXRate;
        const rotateY = 180 * screenYRate;
        
        this._input?.onRotation(rotateX, rotateY);//event.movementX / 5, event.movementY / 10);
    }

}

