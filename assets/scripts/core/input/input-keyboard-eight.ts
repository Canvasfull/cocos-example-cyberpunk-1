import { _decorator, EventKeyboard, input, Input, KeyCode, game, v3, clamp, EventMouse, EventTouch, Canvas, v2, sys } from 'cc';
import { Msg } from '../msg/msg';
import { u3 } from '../util/util';
import { InputBase } from './input-base';
const { ccclass, property } = _decorator;

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

    start () {
        // [3]
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        //input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this); 

        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        //input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
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
        
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP) this.onMove(0, -1);
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN) this.onMove(0, 1);
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.onMove(-1, 0);
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.onMove(1, 0);


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

        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP)  this.onMove(0, 1);
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN)  this.onMove(0, -1);
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.onMove(1, 0);
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.onMove(-1, 0);


        if (this._dir.x === 0 && this._dir.z === 0) this.onMoveEnd();
        if (event.keyCode === KeyCode.SHIFT_LEFT) this._actorInput?.onRun(false);
        if (event.keyCode === KeyCode.ESCAPE) {
            if (document.pointerLockElement && sys.isBrowser) {
                document.exitPointerLock();
                this._isPointerLock = false;
                this.onMoveEnd();
            }
            console.log('on key up:', event.keyCode, this.node.uuid);
            this._actorInput?.onPause();
        }

    }

    onMouseDown(event: EventMouse) {

        if (!document.pointerLockElement && sys.isBrowser) {
            game.canvas.requestPointerLock();
            this._isPointerLock = true;
            return;
        }
       
        if (event.getButton() === 0) {
            this._actorInput?.onFire();
        }
        
    }
    
    onMouseMove(event: EventMouse) {

        if (!document.pointerLockElement && sys.isBrowser) return;

        if (this._pressQ) {
            Msg.emit('msg_select_equip', event.getDelta());
            return;
        }
        //console.log(event.movementX, event.movementY, event.getDeltaX(), event.getDeltaY());
        this._actorInput?.onRotation(event.movementX / 5, event.movementY / 10);
    }

    onTouchMove(event: EventTouch) {
        //this._actorInput?.onRotation(event.getDeltaX() / 5, event.getDeltaY()/ 5);
        this._actorInput?.onRotation(event.getDeltaX() / 5, event.getDeltaY() / 10);
    }

    onMove(x:number, z:number) {
        
        if (!document.pointerLockElement && sys.isBrowser) return;

        this._dir.x = clamp(this._dir.x + x, -1, 1);
        this._dir.z = clamp(this._dir.z + z, -1, 1);
        this._dir.y = 0;
        u3.c(this._move_v3, this._dir);
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

        if (this._move_v3.length() !== 0) u3.c(this._move_dir, this._move_v3);
        this._actorInput?.onMove(this._move_v3);
    }

    update(deltaTime:number) {
        
        /*
        if (!document.pointerLockElement && this._isPointerLock) {
            document.exitPointerLock();
            this._isPointerLock = false;
        }
        */
    }
}

