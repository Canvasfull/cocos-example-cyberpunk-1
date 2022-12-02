import { _decorator, Component, Node, v3 } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { u3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('camera_fps')
export class camera_fps extends Component {

    angle = v3(0, 0, 0);

    _actor:ActorBase = null;

    start() {
        this._actor = this.node.parent.parent.getComponent(ActorBase);
    }

    update(deltaTime: number) {
        this.updateAngle();
    }

    updateAngle() {
        
        u3.c(this.angle, this.node.eulerAngles);
        this.angle.x = this._actor._angle_vertical;
        this.node.setRotationFromEuler(this.angle);

    }

}

