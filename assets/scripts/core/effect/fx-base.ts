import { _decorator, Component, Node, ParticleSystem, resources } from 'cc';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

@ccclass('FxBase')
export class FxBase extends Component {

    @property
    destroyTime = 3;
    particles:ParticleSystem[] | undefined;

    start() {
        this.particles = this.node?.getComponentsInChildren(ParticleSystem);
    }

    play() {
        for (let i = 0; i < this.particles!.length; i++) {
            const particle = this.particles![i];
            particle.stop();
            particle.play();
        }
    }

    remove() {
        fun.delay(()=>{
            this.node.destroy()
        }, this.destroyTime);
    }
}