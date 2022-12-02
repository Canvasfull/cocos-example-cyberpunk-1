
import { _decorator, Component, Node, ParticleSystem, math, CurveRange } from 'cc';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = actor_tail_smoke
 * DateTime = Thu Mar 24 2022 10:14:03 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = actor-tail-smoke.ts
 * FileBasenameNoExtension = actor-tail-smoke
 * URL = db://assets/scripts/logic/actor/actor-tail-smoke.ts
 * ManualUrl = https://docs.cocos.com/creator/3.5/manual/en/
 *
 */
 
@ccclass('ActorTailSmoke')
export class ActorTailSmoke extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    _parical:ParticleSystem;
    _actor:Actor;

    _curRate = 0;
    _realRate = 0;

    curveRange:CurveRange = new CurveRange();

    @property
    ratio:number = 10;

    @property
    smooth:number = 2;

    start () {
        // [3]
        this._parical = this.getComponent(ParticleSystem);
        this._actor = this.node.parent.parent.getComponent(Actor);
    }
}