
import { _decorator, Component, Node, animation, Vec3, v3 } from 'cc';
import { Actor } from './actor';
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

@ccclass('ActorAnimationGraph')
export class ActorAnimationGraph extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    _graph: animation.AnimationController;
    //_actor: Actor = Object.create(null);

    start () {
        // [3]
        this._graph = this.getComponent(animation.AnimationController);
        //this._actor = this.node.parent.parent.getComponent(Actor);
    }

    play (key: string, value: boolean | number) {
        this._graph?.setValue(key, value);
    }

    update (deltaTime: number) {
        //     // [4]
        //this.play('speed', this._actor._data.cur_speed);
        //this.play('move_speed', this._actor._data.cur_speed + 0.5);
        //this.play('is_ground', this._actor._data.is_ground);
    }
}
