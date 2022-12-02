import { _decorator, Component, Node, Input, EventGamepad, Vec2, v3, game, Vec3, input } from 'cc';
import { u3 } from '../util/util';
import { input_base } from './input-base';
const { ccclass, property } = _decorator;

@ccclass('input_gamepad')
export class input_gamepad extends input_base {

    offset_euler = -45;
    move_a = 50;
    move_speed = 50;
    _v_increase_move = 0;
    _move = 0.1;
    _dir = v3(0, 0, 0);
    _move_v3 = v3(0, 0, 0);
    _key_count = 0;

    _cur_key_jump = 0;

    _move_dir = v3(0, 0, 0);

    start() {

        input.on(Input.EventType.GAMEPAD_INPUT, this.onGamePad_Input, this);
        this.offset_euler *= Math.PI / 180;

    }

    onDestroy() {
        input.off(Input.EventType.GAMEPAD_INPUT, this.onGamePad_Input, this);
    }

    onGamePad_Input(event: EventGamepad) {

        var leftStickxAsis = event.gamepad.leftStick.xAxis.getValue();
        var leftStickyAsis = event.gamepad.leftStick.yAxis.getValue();

        this.onMove(leftStickxAsis, -leftStickyAsis);

        var key_jump = event.gamepad.buttonR1.getValue();

        if(key_jump == 1) this.onStart();
        else this.onEnd();

    }

    onStart() {
        if(this._cur_key_jump == 1) return;
        this._cur_key_jump = 1;
        this._actor_input?.onStart();
    }

    onEnd() {
        if(this._cur_key_jump == 0) return;
        this._cur_key_jump = 0;
        this._actor_input?.onEnd();
    }


    onMove(x:number, z:number) {
        this._dir.x = x;
        this._dir.z = z;
        this._dir.y = 0;
        this.onUpdateMove();
    }

    onUpdateMove() {
        u3.c(this._move_v3, this._dir);
        Vec3.rotateY(this._move_v3, this._move_v3, Vec3.ZERO, this.offset_euler);
        if(this._move_v3.length() != 0) u3.c(this._move_dir, this._move_v3);
        this._actor_input?.onMove(this._move_v3);
    }


}

