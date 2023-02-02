import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test_camera_debug')
export class test_camera_debug extends Component {
    start() {

    }

    update(deltaTime: number) {
        console.log(this.node.worldPosition);
    }
}

