import { _decorator, Component, Node, input, Input, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('move_camera_x')
export class move_camera_x extends Component {
    @property
    speed = 1

    _run = false
    start () {
        input.on(Input.EventType.KEY_DOWN, (e) => {
            if (e.keyCode === KeyCode.KEY_M) {
                this._run = true;
            }
        })
    }

    update (deltaTime: number) {
        if (!this._run) return;

        let pos = this.node.position;
        this.node.setPosition(pos.x + deltaTime * this.speed, pos.y, pos.z);
    }
}


