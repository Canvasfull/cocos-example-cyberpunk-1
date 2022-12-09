import { _decorator, Component, Node, Label } from 'cc';
import { Msg } from '../msg/msg';
import { UtilNode } from '../util/util';
import { Local } from './local';
const { ccclass, property } = _decorator;

@ccclass('LocalLabel')
export class LocalLabel extends Component {
    
    label:Label | undefined;

    key:string = '';

    start() {
        Msg.bind('refresh_local',this.refresh, this);
        this.label = UtilNode.getComponent(this.node, Label);
        this.key = this.node.name.slice(6);
        this.refresh();
    }

    onDestroy() {
        Msg.off('refresh_local', this.refresh);
    }

    refresh() {
        this.label!.string = Local.Instance.get(this.key);
    }

}

