import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Achievement } from '../../core/data/achievement';
const { ccclass, property } = _decorator;

@ccclass('ui_achi_all_unlock')
export class ui_achi_all_unlock extends Component {

    spr:Sprite = null;

    @property(SpriteFrame)
    spr_unlock_all:SpriteFrame = Object.create(null);

    onEnable() {
        if(Achievement.Instance.unlockAllAchi) {
            this.spr = this.node.getComponent(Sprite);
            this.spr.spriteFrame = this.spr_unlock_all;
        }
    }
}

