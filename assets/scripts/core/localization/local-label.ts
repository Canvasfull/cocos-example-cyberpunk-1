import { _decorator, Component, Node, Label } from 'cc';
import { Msg } from '../msg/msg';
import { Local } from './local';
const { ccclass, property } = _decorator;

@ccclass('local_label')
export class LocalLabel extends Component {
    
    label:Label = Object.create(null);

    key:string = '';

    start() {
        Msg.on('refresh_local',this.refresh.bind(this));
        this.label = this.getComponent(Label);
        this.key = this.node.name.slice(6);
        this.refresh();
    }

    onDestroy() {
        Msg.off('refresh_local', this.refresh.bind)
    }

    refresh() {
        this.label.string = Local.Instance.get(this.key);
    }

}

