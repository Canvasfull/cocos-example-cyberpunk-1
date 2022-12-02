import { _decorator, Component, Node, ParticleSystem } from 'cc';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

@ccclass('fx_group')
export class fx_group extends Component {

    _particals:ParticleSystem[];

    _loop:boolean = true;

    @property
    delay_time = 1.3

    start() {

        this._particals = this.node.getComponentsInChildren(ParticleSystem);

        this.node.on('setDestroy', this.setDestroy, this);

        this.play(true);

    }

    onDestroy() {
        this.node.off('setDestory', this.setDestroy, this);
    }

    setLoop(value:boolean) {

        for(var i = 0; i < this._particals.length; i++) {
            this._particals[i].loop = value;
        }
        this._loop = value
    }

    setEnable(value:boolean) {
        for(var i = 0; i < this._particals.length; i++) {
            this._particals[i].enabled = value;
        }
    }


    stop(value:boolean) {
        for(var i = 0; i < this._particals.length; i++) {
            this._particals[i].stop();
        }
    }

    play(value:boolean) {
        for(var i = 0; i < this._particals.length; i++) {
            this._particals[i].play();
        }
    }

    setDestroy() {

        this.setLoop(false);
        fun.delay(()=>{
            this.node?.destroy();
        }, this.delay_time);

    }


}

