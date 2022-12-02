import { _decorator, Component, Node, SpriteComponent } from 'cc';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('UiAimRange')
export class UiAimRange extends Component {

    sprite:SpriteComponent;

    start() {
        this.sprite = this.getComponent(SpriteComponent);
        Msg.onbind('msg_update_aim', this.updateAim, this);
        this.updateAim(0);
    }
  
    updateAim(size:number) {
        this.node.setWorldScale(size, size, size);
    }
}

