import { _decorator, Component, Node, Input, EventTouch, game } from 'cc';
import { Msg } from '../msg/msg';
import { InputJoystick } from './input-joystick';
const { ccclass, property } = _decorator;

@ccclass('JoystickPadRotation')
export class JoystickPadRotation extends Component {

    _input:InputJoystick | undefined;

    touchID:number | null = -1;

    start() {
        this._input = this.node.parent!.getComponent(InputJoystick)!;
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onTouchStart(event: EventTouch) {
        if(this.touchID !== -1) return;
        this.touchID = event.getID();
    }

    onTouchMove(event: EventTouch) {

        if(this.touchID != -1) return;

        const currentTouchID = event.getID();
        if(currentTouchID == null) return;

        this.touchID = currentTouchID;

        const x = event.getDeltaX();
        const y = event.getDeltaY();

        const screenXRate = x / game.canvas!.width;
        const screenYRate = y / game.canvas!.height;

        const rotateX = 900 * screenXRate;
        const rotateY = 900 * screenYRate;
        
        this._input?.onRotation(rotateX, rotateY);//event.movementX / 5, event.movementY / 10);
    }

    onTouchCancel(event: EventTouch) {
        this.touchID = -1;
    }

    onTouchEnd(event: EventTouch) {
        this.touchID = -1;
    }

}

