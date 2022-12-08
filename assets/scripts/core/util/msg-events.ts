import { _decorator, Component, Node } from 'cc';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('MsgEvents')
export class MsgEvents extends Component {

    @property
    msg = '';

    start() {

        Msg.bind(this.msg, this.setActive, this);

    }

    public setActive(active:boolean) {
        this.node.active = active;
    }
}

