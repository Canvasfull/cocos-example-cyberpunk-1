import { _decorator, Component, Node, SpriteComponent, v3 } from 'cc';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('UIAimRange')
export class UIAimRange extends Component {

    sprite:SpriteComponent | undefined | null;

    dirs = [[1,0],[0,1],[-1,0],[0,-1]];

    baseSize = 40;

    start() {
        this.sprite = this.getComponent(SpriteComponent);

        if (this.sprite === undefined) {
            throw new Error(`${this.node.name} node UIAimRange can not find sprite component.`);
        }

        Msg.bind('msg_update_aim', this.updateAim, this);
        this.updateAim(0);
    }
  
    updateAim(size:number) {
        const currentSize = size * this.baseSize;
        for(let i = 0; i < this.node.children.length; i++) {
            const child = this.node.children[i];
            const dir = this.dirs[i];
            child.setPosition(dir[0] * currentSize, dir[1] * currentSize, 0);
        }

    }
}

