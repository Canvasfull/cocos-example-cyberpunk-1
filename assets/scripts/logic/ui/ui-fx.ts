import { _decorator, Component, Node } from 'cc';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('UIFx')
export class UIFx extends Component {

    map:Record<string, Node> = {};

    start() {

        for(let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i];
            this.map[child.name] = child;
        }

        Msg.on('msg_ui_fx_open', this.open.bind(this));
        Msg.on('msg_ui_fx_close', this.close.bind(this));

    }

    open(name:string) {
        const effect = this.map[name];
        if(effect !== undefined) effect.active = true;
    }

    close(name:string) {
        const effect = this.map[name];
        if(effect !== undefined) effect.active = false;
    }

}

