import { _decorator, Component, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { UtilNode } from '../../core/util/util';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorPart')
export class ActorPart extends Component {

    actor:ActorBase | undefined;

    __preload() {
        this.actor = UtilNode.getParentComponent(this.node, ActorBase);
    }
}

