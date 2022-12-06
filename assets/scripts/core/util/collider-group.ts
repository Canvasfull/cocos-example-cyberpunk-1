import { _decorator, Component, Node, Collider } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColliderGroup')
export class ColliderGroup extends Component {

    @property
    group: number = 0;

    onEnable () {
        this.node.getComponent(Collider)?.setGroup(1 << this.group);
    }

}

