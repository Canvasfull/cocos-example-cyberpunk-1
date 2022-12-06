import { _decorator, Component, Node, Vec3 } from 'cc';
import { InputBase } from './input-base';
const { ccclass, property } = _decorator;

@ccclass('InputJoystick')
export class InputJoystick extends InputBase {

    onStart() {
        //this._actorInput?.onStart();
    }

    onEnd() {
        //this._actorInput?.onEnd();
    }

    onMove(dir:Vec3) {
        //this._actorInput?.onMove(dir, undefined);
    }
}

