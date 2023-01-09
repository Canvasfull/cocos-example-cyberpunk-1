import { _decorator, Component, Node, v3 } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { UtilVec3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('camera_fps')
export class camera_fps extends Component {

    angle = v3(0, 0, 0);

    @property(Node)
    root:Node | undefined;

    @property(ActorBase)
    _actor:ActorBase | undefined;

    start() {
        this._actor = this.root?.getComponent(ActorBase)!;
    }

    update(deltaTime: number) {
        this.updateAngle();
    }

    updateAngle() {
        
        UtilVec3.copy(this.angle, this.node.eulerAngles);
        this.angle.x = this._actor!._angleVertical;
        this.node.setRotationFromEuler(this.angle);

    }

}

