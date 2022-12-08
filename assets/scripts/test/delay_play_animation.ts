import { _decorator, Component, Node, Animation, input, Input, EventKeyboard, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DelayPlayAnimation')
export class DelayPlayAnimation extends Component {


    @property
    delay = 2;

    @property
    anim_name:string = 'minmax.com';

    start() {

        input.on(Input.EventType.KEY_UP, (event:EventKeyboard)=>{
            if (event.keyCode === KeyCode.SPACE) this.delayPlay();
        }, this)

    }

    delayPlay() {
        setTimeout(()=>{ 
            this.node.getComponent(Animation)?.play(this.anim_name);
            var anim = this.node.getComponent(Animation);
        }, this.delay * 1000);
    }
}

