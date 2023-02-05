import { _decorator, Component, Node, ParticleSystem } from 'cc';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

@ccclass('FxGroup')
export class FxGroup extends Component {

    _particles:ParticleSystem[] | undefined;

    _loop:boolean = true;

    @property
    delayTime = 3;

    start() {

        this._particles = this.node.getComponentsInChildren(ParticleSystem);
        this.node.on('setDestroy', this.setDestroy, this);
        this.play(true);

        if (this._particles === undefined || this._particles.length <= 0) {
            throw new Error(`This node ${this.node.name} can not find particles.`);
        }

    }

    onDestroy() {
        this.node.off('setDestroy', this.setDestroy, this);
    }

    setLoop(value:boolean) {

        for(let i = 0; i < this._particles!.length; i++) {
            this._particles![i].loop = value;
        }
        this._loop = value
    }

    setEnable(value:boolean) {
        for(let i = 0; i < this._particles!.length; i++) {
            this._particles![i].enabled = value;
        }
    }


    stop(value:boolean) {
        for(let i = 0; i < this._particles!.length; i++) {
            this._particles![i].stop();
        }
    }

    play(value:boolean) {
        for(let i = 0; i < this._particles!.length; i++) {
            this._particles![i].play();
        }
    }

    setDestroy() {

        this.setLoop(false);
        fun.delay(()=>{
            this.node?.destroy();
        }, this.delayTime);

    }


}

