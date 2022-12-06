import { _decorator, Component, Node, SpriteComponent } from 'cc';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('UIAimRange')
export class UIAimRange extends Component {

    sprite:SpriteComponent | undefined | null;

    start() {
        this.sprite = this.getComponent(SpriteComponent);

        if(this.sprite == undefined) {
            throw new Error(`${this.node.name} node UIAimRange can not find sprite component.`);
        }

        Msg.bind('msg_update_aim', this.updateAim, this);
        this.updateAim(0);
    }
  
    updateAim(size:number) {
        this.node.setWorldScale(size, size, size);
    }
}

