import { _decorator, Component, Node, Input, EventGamepad, Vec2, v3, game, Vec3, input, v2 } from 'cc';
import { UtilVec3 } from '../util/util';
import { InputBase } from './input-base';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

export let isGamePad = false;

@ccclass('InputGamepad')
export class InputGamepad extends InputBase {

    offset_euler = -45;
    move_a = 50;
    move_speed = 50;
    _v_increase_move = 0;
    _move = 0.1;
    _dir = v3(0, 0, 0);
    _move_v3 = v3(0, 0, 0);
    _key_count = 0;
    _curKeyJump = 0;
    _move_dir = v3(0, 0, 0);

    _isChangeEquips:boolean | undefined = false;

    _checkGamepadTime = 2;

    start() {
        input.on(Input.EventType.GAMEPAD_INPUT, this.onGamePad_Input, this);
        this.offset_euler *= Math.PI / 180;
    }

    onDestroy() {
        input.off(Input.EventType.GAMEPAD_INPUT, this.onGamePad_Input, this);
    }

    onGamePad_Input(event: EventGamepad) {

        this._checkGamepadTime = 2;
        isGamePad = true;

        const leftStickXAxis = event.gamepad.leftStick.xAxis.getValue();
        const leftStickYAxis = event.gamepad.leftStick.yAxis.getValue();

        this.onMove(leftStickXAxis, -leftStickYAxis);

        const rightStickXAxis = event.gamepad.rightStick.xAxis.getValue();
        const rightStickYAxis = event.gamepad.rightStick.yAxis.getValue();

        this.onRotation(rightStickXAxis * 5, rightStickYAxis * 5);

        const isFire = event.gamepad.buttonR1.getValue();
        if(isFire) this._actorInput?.onFire();

        const isJump = event.gamepad.buttonR2.getValue();
        if(isJump) this._actorInput?.onJump();

        const isRun = event.gamepad.buttonL2.getValue();
        this._actorInput?.onRun(isRun === 1);

        const isChangeWeapon = event.gamepad.buttonL1.getValue();
        if(isChangeWeapon) {
            this._isChangeEquips = this._actorInput?.onChangeEquips();
        }

        const isReload = event.gamepad.buttonEast.getValue();
        if(isReload) this._actorInput?.onReload();



        const isCrouch = event.gamepad.buttonWest.getValue();
        if(isCrouch) this._actorInput?.onCrouch();

        //const isProne = event.gamepad.buttonNorth.getValue();
        //if(isProne) this._actorInput?.onProne();

        const isPick = event.gamepad.buttonSouth.getValue();
        if(isPick) this._actorInput?.onPick();

        const isPause = event.gamepad.buttonOptions.getValue();
        if(isPause) this._actorInput?.onPause();

    }


    onMove(x:number, z:number) {
        this._dir.x = x;
        this._dir.z = z;
        this._dir.y = 0;
        this.onUpdateMove();
    }

    onUpdateMove() {
        UtilVec3.copy(this._move_v3, this._dir);
        Vec3.rotateY(this._move_v3, this._move_v3, Vec3.ZERO, this.offset_euler);
        if (this._move_v3.length() !== 0) UtilVec3.copy(this._move_dir, this._move_v3);
        this._actorInput?.onMove(this._move_v3);
    }


    onRotation(deltaX:number, deltaY:number) {

        if(this._isChangeEquips) {
            console.log('select_equip', deltaX, deltaY);
            Msg.emit('msg_select_equip', v2(deltaX, deltaY));
            return;
        }

        this._actorInput?.onRotation(deltaX, -deltaY);
    }

    update(deltaTime:number) {

        this._checkGamepadTime -= deltaTime;
        if(this._checkGamepadTime < 0) {
            isGamePad = false;
        }


    }


}

