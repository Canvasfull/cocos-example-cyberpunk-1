import { _decorator, Component, Node, v2, Vec2, Vec3 } from 'cc';
import { InputBase } from './input-base';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('InputJoystick')
export class InputJoystick extends InputBase {

    _isRun = false;

    _isChangeEquips:boolean | undefined = false;

    onChangeEquips() {
        this._isChangeEquips = this._actorInput?.onChangeEquips();
    }

    onMove(dir:Vec3) {
        this._actorInput?.onMove(dir);
    }

    onFire() {
        this._actorInput?.onFire();
    }

    onJump() {
        this._actorInput?.onJump();
    }

    onCrouch() {
        this._actorInput?.onCrouch();
    }

    onProne() {
        //this._actorInput?.onProne();
    }

    onPick() {
        this._actorInput?.onPick();
    }

    onDrop() {
        this._actorInput?.onDrop();
    }

    onReload() {
        this._actorInput?.onReload();
    }

    onRun() {
        this._isRun = !this._isRun;
        this._actorInput?.onRun(this._isRun);
    }

    onRotation(deltaX:number, deltaY:number) {

        if(this._isChangeEquips) {
            Msg.emit('msg_select_equip', v2(deltaX, deltaY));
            return;
        }

        this._actorInput?.onRotation(deltaX/5, -deltaY/5);
    }
}

