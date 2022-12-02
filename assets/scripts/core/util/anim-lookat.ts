import { _decorator, Component, Node, Vec3, Quat } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('anim_lookat')
export class anim_lookat extends Component {

    _angle: Quat;
    start () {
    }

    update (deltaTime: number) {

    }

    lateUpdate (deltaTime: number) {
        //this.node.setWorldRotationFromEuler(0, 0, 0);
    }
}

