import { _decorator, Component, EventMouse, game, Input, input, Node } from 'cc';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

export let _pointerLock = false;

@ccclass('InputPointerLock')
export class InputPointerLock extends Component {

    start() {
        document.addEventListener('pointerlockchange', this.onPointerChange, false);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
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

}

