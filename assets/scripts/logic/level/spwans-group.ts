import { _decorator, Component, Node, Camera, director, game, MeshRenderer } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('spwans_group')
export class spwans_group extends Component {

    onEnable() {
        this.node.children.forEach(child => {
            child.getComponent(MeshRenderer).enabled = false;
        });
    }

    start() {
    }

    update(deltaTime: number) {
        
    }


}

