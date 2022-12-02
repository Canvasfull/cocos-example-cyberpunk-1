import { _decorator, Component, Node, find } from 'cc';
import { UtilNode } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('ActorLookat')
export class ActorLookat extends Component {

    @property
    bone_name = 'bone_ head_zhuandong';

    @property(Node)
    bone_head: Node = Object.create(null);

    _angle = 0;
    _dir = 1;

    start () {
        this.bone_head = UtilNode.find(this.node, this.bone_name);
    }

    lateUpdate (deltaTime: number) {

        this.bone_head?.setRotationFromEuler(this._angle, 0, 0);

    }
}

