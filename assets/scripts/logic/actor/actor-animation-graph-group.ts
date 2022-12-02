
import { _decorator, Component, Node, animation, Vec3, v3 } from 'cc';
import { Actor } from './actor';
import { ActorAnimationGraph } from './actor-animation-graph';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = actor_animation_graph
 * DateTime = Wed Mar 23 2022 16:24:47 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = actor-animation-graph.ts
 * FileBasenameNoExtension = actor-animation-graph
 * URL = db://assets/scripts/logic/actor/actor-animation-graph.ts
 * ManualUrl = https://docs.cocos.com/creator/3.5/manual/en/
 *
 */

@ccclass('ActorAnimationGraphGroup')
export class ActorAnimationGraphGroup extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    _groups:ActorAnimationGraph[];

    start () {
        // [3]
        this._groups = this.getComponentsInChildren(ActorAnimationGraph);
    }

    play (key: string, value: boolean | number) {
        console.log('ActorAnimationGraphGroup', key, value);
        for(let i = 0; i < this._groups.length; i++) {
            this._groups[i].play(key, value);
        }
    }
    
}
