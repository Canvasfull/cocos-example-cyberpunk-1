
import { _decorator, Component, ParticleSystem, CurveRange } from 'cc';
import { Actor } from './actor';
const { ccclass, property } = _decorator;
 
@ccclass('ActorTailSmoke')
export class ActorTailSmoke extends Component {
    _particle:ParticleSystem | undefined;
    _actor:Actor | undefined;

    _curRate = 0;
    _realRate = 0;

    curveRange:CurveRange = new CurveRange();

    @property
    ratio:number = 10;

    @property
    smooth:number = 2;

    start () {
        // [3]
        this._particle = this.getComponent(ParticleSystem)!;
        this._actor = this.node.parent.parent.getComponent(Actor);
    }
}