import { _decorator, Component, Node, Animation } from 'cc';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('MsgPlayAnimation')
export class MsgPlayAnimation extends Component {

    @property
    animName = 'animation';

    @property(String)
    msg = 'msg_play_animation';

    animation:Animation | undefined;

    start() {

        this.animation = this.getComponent(Animation)!;
        Msg.on(this.msg, ()=>{
            this.animation?.stop();
            this.animation?.play(this.animName);
        })

    }
}

