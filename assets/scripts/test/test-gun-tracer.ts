import { _decorator, Component, EventKeyboard, input, Input, KeyCode, randomRange, v3, Vec3 } from 'cc';
import { Msg } from '../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('TestGunTracer')
export class TestGunTracer extends Component {

    start() {
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);
    }


    keyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_R) {
            const start = Vec3.ZERO;
            const end = v3(randomRange(0, 30), 1, randomRange(0, 30));
            Msg.emit('msg_set_tracer', {start, end});
        }
    }

    update(deltaTime: number) {
        
    }
}

