import { _decorator, Component, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorPart')
export class ActorPart extends Component {

    @property(ActorBase)
    actor:ActorBase;
}

