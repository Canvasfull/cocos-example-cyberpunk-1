import { _decorator, Component, EventKeyboard, EventMouse, game, Input, input, KeyCode, Node } from 'cc';
import { fun } from '../util/fun';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

export let _pointerLock = false;

@ccclass('InputPointerLock')
export class InputPointerLock extends Component {

    start() {
        document.addEventListener('pointerlockchange', this.onPointerChange, false);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);

        // Register keyboard events.
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        //Msg.on('msg_point')
    }

    onDestroy() {
        document.removeEventListener('pointerlockchange', this.onPointerChange, false);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    onPointerChange() {
        if(document.pointerLockElement === game.canvas) {
            _pointerLock = true;
        }else{
            fun.delay(()=>{
                _pointerLock = false;
            }, 2);
        }
    }

    onMouseDown(event: EventMouse) {

        if (!_pointerLock) {
            try {
                if(game.canvas?.requestPointerLock) {
                    game.canvas?.requestPointerLock();
                }
            }catch (error) {
                console.warn(error);
            }            
            return;
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.ESCAPE) {
            document.exitPointerLock();
        }
    }

}

