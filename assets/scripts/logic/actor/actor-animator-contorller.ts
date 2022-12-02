
import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = actor_animator_contorller
 * DateTime = Sun Feb 27 2022 15:58:03 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = actor-animator-contorller.ts
 * FileBasenameNoExtension = actor-animator-contorller
 * URL = db://assets/scripts/logic/actor/actor-animator-contorller.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('ActorAnimatorContorller')
export class ActorAnimatorContorller extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    _anim:SkeletalAnimation = Object.create(null);
    _data = Object.create(null);

    init(_data) {
        this._data = _data;
        this._anim = this.getComponent(SkeletalAnimation);
    }

    play(name: string) {
        var anims = this._data[name];
        this._anim.play(anims[0]);
    }
    
}
