
import { _decorator, Component, Node, EventKeyboard, EventMouse, EventTouch, input, Input, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = joystick
 * DateTime = Fri Jan 14 2022 19:16:30 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = joystick.ts
 * FileBasenameNoExtension = joystick
 * URL = db://assets/scripts/core/input/joysitck.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('Joystick')
export class Joystick extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    start () {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPRESSING, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        // Mouse Event
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
    }

    onKeyDown(event: EventKeyboard) {
    }

    onKeyPRESSING(event: EventKeyboard) {
        if(event.keyCode == KeyCode.KEY_A) {
            console.log('press right.');
        }
    }

    onKeyUp(event: EventKeyboard) {
    }

    onTouchStart(event: EventTouch) {
    }

    onTouchMove(event: EventTouch) {
    }

    onTouchEnd(event: EventTouch) {
    }

    onTouchCancel(event: EventTouch) {
    }

    onMouseDown(event: EventMouse) {
    }

    onMouseUp(event: EventMouse) {
    }

    onMouseMove(event: EventMouse) {
    }

    onMouseWheel(event: EventMouse) {
    }

}
