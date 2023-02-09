/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { _decorator, EventKeyboard, input, Input, KeyCode, game, v3, EventMouse,} from 'cc';
import { Msg } from '../msg/msg';
import { InputBase } from './input-base';
import { fun } from '../util/fun';
import { Level } from '../../logic/level/level';
const { ccclass, property } = _decorator;

let _pointerLock = false;

@ccclass('InputKeyboard')
export class InputKeyboard extends InputBase {

    move_a = 50;
    move_speed = 50;

    _dir = v3(0, 0, 0);
    key_count = 0;

    _pressQ = false;

    direction_up = 0;
    direction_down = 0;
    direction_left = 0;
    direction_right = 0;

    start () { 

        // Register keyboard events.
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        // Register mouse events.
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        document.addEventListener('pointerlockchange', this.onPointerChange, false);
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

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this); 

        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        document.removeEventListener('pointerlockchange', this.onPointerChange, false);
    }

    hasKey(event: EventKeyboard): boolean {
        return (event.keyCode === KeyCode.KEY_W || 
            event.keyCode === KeyCode.KEY_S || 
            event.keyCode === KeyCode.KEY_A ||
            event.keyCode === KeyCode.KEY_D ||
            event.keyCode === KeyCode.KEY_E ||
            event.keyCode === KeyCode.KEY_G ||
            event.keyCode === KeyCode.KEY_Q ||
            event.keyCode === KeyCode.KEY_C ||
            event.keyCode === KeyCode.KEY_N ||
            event.keyCode === KeyCode.KEY_R ||
            event.keyCode === KeyCode.SPACE ||
            event.keyCode === KeyCode.ARROW_UP ||
            event.keyCode === KeyCode.ARROW_LEFT ||
            event.keyCode === KeyCode.ARROW_RIGHT || 
            event.keyCode === KeyCode.ARROW_DOWN ||
            event.keyCode === KeyCode.SHIFT_LEFT ||
            event.keyCode === KeyCode.ESCAPE ||
            event.keyCode === KeyCode.KEY_T
            );
    }

    onKeyDown(event: EventKeyboard) {

        if(Level.Instance.stop) {
            this.clear();
            return;
        }

        if (!this.hasKey(event)) return;

        this.key_count++;

        /*
        if (event.keyCode === KeyCode.KEY_Q) {
            Msg.emit('push', "select_equips");
            //this._pressQ = true;
            return;
        }
        */
        
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP) this.direction_up = 1;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN) this.direction_down = -1; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = 1;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = -1;


        if(event.keyCode === KeyCode.KEY_Q) { 
            
            this._actorInput?.onChangeEquips();
            document.exitPointerLock();
        
        }

        if (event.keyCode === KeyCode.SPACE) this._actorInput?.onJump();
        if (event.keyCode === KeyCode.KEY_C) this._actorInput?.onCrouch();
        if (event.keyCode === KeyCode.KEY_N) this._actorInput?.onAim(undefined);
        if (event.keyCode === KeyCode.KEY_E) this._actorInput?.onPick();
        if (event.keyCode === KeyCode.KEY_G) this._actorInput?.onDrop();
        if (event.keyCode === KeyCode.KEY_R) this._actorInput?.onReload();
        if (event.keyCode === KeyCode.SHIFT_LEFT) this._actorInput?.onRun(true);

        if(event.keyCode === KeyCode.KEY_T) Msg.emit('msg_change_tps_camera_target', 2);



    }

    onKeyUp(event: EventKeyboard) {

        if(Level.Instance.stop) {
            this.clear();
            return;
        }
        
        if (event.keyCode === 0 || this.key_count <= 0) {
            this._pressQ = false;
            this.clear();
            return;
        }

        if (!this.hasKey(event)) return;

        this.key_count--;

        /*
        if (event.keyCode === KeyCode.KEY_Q) {
            this._pressQ = false;
            Msg.emit('back');
            return;
        }
        */

        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP)  this.direction_up = 0;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN)  this.direction_down = 0; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = 0;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 0;

        if (event.keyCode === KeyCode.SHIFT_LEFT) this._actorInput?.onRun(false);
        if (event.keyCode === KeyCode.ESCAPE) {
            this._actorInput?.onPause();
        }

    }

    onMouseDown(event: EventMouse) {

        if(Level.Instance.stop) {
            this.clear();
            return;
        }

        /*
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
        */
       
        if (event.getButton() === 0) {
            this._actorInput?.onFire();
        }
        
    }
    
    onMouseMove(event: EventMouse) {

        if(Level.Instance.stop) {
            this.clear();
            return;
        }

        //if (document.pointerLockElement === null && sys.isBrowser) return;
        /*
        if (this._pressQ) {
            Msg.emit('msg_select_equip', event.getDelta());
            return;
        }
        */

        const x = event.movementX;
        const y = event.movementY;

        const screenXRate = x / game.canvas!.width;
        const screenYRate = y / game.canvas!.height;

        const rotateX = 360 * screenXRate;
        const rotateY = 180 * screenYRate;
        
        this._actorInput?.onRotation(rotateX, rotateY);//event.movementX / 5, event.movementY / 10);
    }

    onMove() {
        //if (document.pointerLockElement === null && sys.isBrowser) return;
        this._dir.x = this.direction_left + this.direction_right;
        this._dir.z = this.direction_up + this.direction_down;
        this._dir.y = 0;
        this._actorInput?.onMove(this._dir.normalize());
    }

    clear() {
        this.direction_up = 0;
        this.direction_down = 0;
        this.direction_left = 0;
        this.direction_right = 0;
    }
    
    update(deltaTime:number) {
        this.onMove();
    }
}

