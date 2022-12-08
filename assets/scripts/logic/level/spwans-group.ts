import { _decorator, Component, Node, Camera, director, game, MeshRenderer } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

@ccclass('SpawnsGroup')
export class SpawnsGroup extends Component {

    onEnable() {
        this.node.children.forEach(child => {
            const meshRender = child.getComponent(MeshRenderer);
            if (meshRender) meshRender.enabled = false;
        });
    }

    start() {
    }

    update(deltaTime: number) {
        
    }


}

