import { _decorator, EventKeyboard, input, Input, KeyCode, game, v3, clamp, EventMouse, EventTouch, Canvas, v2, sys } from 'cc';
import { Msg } from '../msg/msg';
import { UtilVec3 } from '../util/util';
import { InputBase } from './input-base';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

let _pointerLock = false;

@ccclass('InputKeyboardEight')
export class InputKeyboardEight extends InputBase {

    move_a = 50;
    move_speed = 50;
    _v_increase_move = 0;
    _move = 0.1;
    _dir = v3(0, 0, 0);
    _move_v3 = v3(0, 0, 0);
    _key_count = 0;
    _move_dir = v3(0, 0, 0);

    _isPointerLock = false;
    _pressQ = false;

    _waitPointerTime = 2;

    direction_up = 0;
    direction_down = 0;
    direction_left = 0;
    direction_right = 0;

    start () {
        
        this._isPointerLock = false;

        // [3]
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

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
            event.keyCode === KeyCode.KEY_Z ||
            event.keyCode === KeyCode.KEY_R ||
            event.keyCode === KeyCode.SPACE ||
            event.keyCode === KeyCode.ARROW_UP ||
            event.keyCode === KeyCode.ARROW_LEFT ||
            event.keyCode === KeyCode.ARROW_RIGHT || 
            event.keyCode === KeyCode.ARROW_DOWN ||
            event.keyCode === KeyCode.SHIFT_LEFT ||
            event.keyCode === KeyCode.ESCAPE
            );
    }

    onKeyDown(event: EventKeyboard) {

        if (!this.hasKey(event)) return;

        this._key_count++;

        if (event.keyCode === KeyCode.KEY_Q) {
            Msg.emit('push', "select_equips");
            this._pressQ = true;
            return;
        }
        
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP) this.direction_up = -1;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN) this.direction_down = 1; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = -1;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 1;


        if (event.keyCode === KeyCode.SPACE) this._actorInput?.onJump();
        if (event.keyCode === KeyCode.KEY_C) this._actorInput?.onCrouch();
        if (event.keyCode === KeyCode.KEY_Z) this._actorInput?.onProne();
        if (event.keyCode === KeyCode.KEY_E) this._actorInput?.onPick();
        if (event.keyCode === KeyCode.KEY_G) this._actorInput?.onDrop();
        if (event.keyCode === KeyCode.KEY_R) this._actorInput?.onReload();

        if (event.keyCode === KeyCode.SHIFT_LEFT) this._actorInput?.onRun(true);

    }

    onKeyUp(event: EventKeyboard) {
        
        if (event.keyCode === 0 || this._key_count <= 0) {
            this._pressQ = false;
            this.onMoveEnd();
            this.onUpdateMove();
            console.log('error keyboard event do.');
            return;
        }

        if (!this.hasKey(event)) return;

        this._key_count--;

        if (event.keyCode === KeyCode.KEY_Q) {
            this._pressQ = false;
            Msg.emit('back');
            return;
        }

        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP)  this.direction_up = 0;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN)  this.direction_down = 0; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = 0;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 0;
        this.onMove();


        if (this._dir.x === 0 && this._dir.z === 0) this.onMoveEnd();
        if (event.keyCode === KeyCode.SHIFT_LEFT) this._actorInput?.onRun(false);
        if (event.keyCode === KeyCode.ESCAPE) {
            this._actorInput?.onPause();
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
       
        if (event.getButton() === 0) {
            this._actorInput?.onFire();
        }
        
    }
    
    onMouseMove(event: EventMouse) {

        //if (document.pointerLockElement === null && sys.isBrowser) return;

        if (this._pressQ) {
            Msg.emit('msg_select_equip', event.getDelta());
            return;
        }
        
        this._actorInput?.onRotation(event.movementX / 5, event.movementY / 10);
    }

    onMove() {
        //if (document.pointerLockElement === null && sys.isBrowser) return;
        this._dir.x = this.direction_left + this.direction_right;
        this._dir.z = this.direction_up + this.direction_down;
        this._dir.y = 0;
        UtilVec3.copy(this._move_v3, this._dir);
        this.onUpdateMove();
    }

    onMoveEnd() {
        this._move = 0.1;
        this._dir.x = 0;
        this._dir.y = 0;
        this._dir.z = 0;
        this._v_increase_move = 0;
        this.onUpdateMove();
    }

    onUpdateMove() {
        this._v_increase_move += this.move_a * game.deltaTime;
        this._move += (this.move_speed + this._v_increase_move) * game.deltaTime;
        if (this._move > 1) this._move = 1;
        this._move_v3.normalize().multiplyScalar(this._move);
        if (this._move_v3.length() !== 0) UtilVec3.copy(this._move_dir, this._move_v3);
        this._actorInput?.onMove(this._move_v3);
    }

    update(deltaTime:number) {
        /*
        if(document.pointerLockElement === null && this._isPointerLock) {
            console.log('enter event mouse pointer lock. exitPointerLock.');
            document.exitPointerLock();
            this._isPointerLock = false;
        }
        */
    }
}

