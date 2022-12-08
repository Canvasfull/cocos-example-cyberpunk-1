import { _decorator, Component, Node, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FxBase')
export class FxBase extends Component {

    @property
    destroyTime = 3;

    start() {

        this.node.children[0].active = true;

    }

    update(deltaTime: number) {

        this.destroyTime -= deltaTime;

        if (this.destroyTime < 0) {
            this.node.destroy();
        }
        
    }

}

