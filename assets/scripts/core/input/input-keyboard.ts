
import { _decorator, Component, Node, EventKeyboard, input, Input, KeyCode, game, v3, math } from 'cc';
import { Msg } from '../msg/msg';
import { u3 } from '../util/util';
import { InputBase } from './input-base';
const { ccclass, property } = _decorator;

@ccclass('InputKeyboard')
export class InputKeyboard extends InputBase {

    @property
    key_jump = KeyCode.SPACE;
    @property
    key_left_rotation = KeyCode.KEY_A;
    @property
    key_right_rotation = KeyCode.KEY_D;
    @property
    key_foward = KeyCode.KEY_W;
    @property
    key_back = KeyCode.KEY_S;

    euler_speed = 2000;
    euler_a = 0;
    max_euler = 30;
    _v_increase_euler = 0;

    move_a = 50;
    move_speed = 50;
    _v_increase_move = 0;

    _euler_y = 0.0;
    _move = 0.1;
    _dir = v3(0, 0, 0);
    _move_v3 = v3(0, 0, 0);

    _control_count = 0;

    start () {
        // [3]
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPRESSING, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyPRESSING, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this); 
    }

    onKeyDown(event: EventKeyboard) {
        
        if(event.keyCode == this.key_jump) this.onStart();
        if(event.keyCode == this.key_foward) this.onMove(1)

        if(event.keyCode == this.key_left_rotation) this.onRotation(-1);
        if(event.keyCode == this.key_right_rotation) this.onRotation(1);
        if(event.keyCode == this.key_back) this.onRotationBack();

        this._control_count++;

        console.log('on key down:', this._control_count);
    }

    onKeyPRESSING(event: EventKeyboard) {

        if(event.keyCode == this.key_foward) this.onMove(1)
        if(event.keyCode == this.key_left_rotation) this.onRotation(-1);
        if(event.keyCode == this.key_right_rotation) this.onRotation(1);

    }

    onKeyUp(event: EventKeyboard) {

        if(event.keyCode == this.key_foward) this.onMoveEnd();
        if(event.keyCode == this.key_jump) this.onEnd();

        this._control_count--;
        console.log('on key up:', this._control_count);
    }

    onStart() {
        this._actor_input?.onStart();
    }

    onEnd() {
        this._actor_input?.onEnd();
    }

    onRotation(dir:number) {
        this._v_increase_euler += this.euler_a * game.deltaTime * dir;
        if(this._v_increase_euler > this.max_euler) this._v_increase_euler = this.max_euler;
        var increase = dir * (this.euler_speed + this._v_increase_euler) * game.deltaTime;
        this._euler_y += increase;
    }

    onRotationBack() {
        this._euler_y += 180;
    }
    
    onMove(dir:number) {
        this._v_increase_move += dir * this.move_a * game.deltaTime * dir;
        this._move += dir * (this.move_speed + this._v_increase_move) * game.deltaTime;
        if(this._move > 1) this._move = 1;
        else if(this._move < -1) this._move = -1;
    }

    onMoveEnd() {
        this._move = 0.1;
        this._v_increase_move = 0;
        this.onUpdateMove();
    }

    onUpdateMove() {
        var toRad = Math.PI / 180;
        this._dir.z = -1 * Math.cos(this._euler_y * toRad);
        this._dir.x = 1 * Math.sin(this._euler_y * toRad);
        this._dir.y = 0;
        u3.c(this._move_v3, this._dir);
        this._move_v3.multiplyScalar(this._move);
        this._actor_input?.onMove(this._move_v3, this._dir);
        console.log('dir:', this._dir);
    }

    update(deltaTime: number) {

        console.log(this._control_count);
        if(this._control_count > 0) {
            this.onUpdateMove();
        }

    }

}