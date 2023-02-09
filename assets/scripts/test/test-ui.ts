import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test_ui')
export class test_ui extends Component {

    start() {

        console.log(this.node.name, this.node.position, this.node.worldPosition);

    }

    update(deltaTime: number) {
        
    }
}

