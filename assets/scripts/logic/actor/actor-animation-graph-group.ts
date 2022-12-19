
import { _decorator, Component, Node, animation, Vec3, v3 } from 'cc';
import { Actor } from './actor';
import { ActorAnimationGraph } from './actor-animation-graph';
const { ccclass, property } = _decorator;

@ccclass('ActorAnimationGraphGroup')
export class ActorAnimationGraphGroup extends Component {

    _groups:ActorAnimationGraph[] | undefined;

    __preload () {
        this._groups = this.getComponentsInChildren(ActorAnimationGraph);
        if (this._groups === undefined || this._groups === null) {
            throw new Error(`${this.node.name} node not find ActorAnimationGraph`);
        }
    }

    play (key: string, value: boolean | number) {
        console.log('ActorAnimationGraphGroup', key, value);
        for(let i = 0; i < this._groups!.length; i++) {
            this._groups![i].play(key, value);
        }
    }
    
}
