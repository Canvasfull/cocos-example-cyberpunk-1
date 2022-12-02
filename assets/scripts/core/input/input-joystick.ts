import { _decorator, Component, Node, Vec3 } from 'cc';
import { input_base } from './input-base';
const { ccclass, property } = _decorator;

@ccclass('input_joystick')
export class input_joystick extends input_base {

    onStart() {
        this._actor_input?.onStart();
    }

    onEnd() {
        this._actor_input?.onEnd();
    }

    onMove(dir:Vec3) {
        this._actor_input?.onMove(dir, undefined);
    }
}

