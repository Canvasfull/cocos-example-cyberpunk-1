import { _decorator, Component, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { UtilNode } from '../../core/util/util';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorPart')
export class ActorPart extends Component {

    @property( { type:ActorBase } )
    actor:ActorBase | undefined;

    @property
    part = 'body';

}

