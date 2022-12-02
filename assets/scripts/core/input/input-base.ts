import { _decorator, Component, Node } from 'cc';
import { ActorInput } from '../../logic/actor/actor-input';
import { IActorInput } from './IActorInput';

const { ccclass, property } = _decorator;

@ccclass('input_base')
export class input_base extends Component {

    _actor_input:IActorInput;

    onEnable() {
        this._actor_input = this.node.parent.getComponent(ActorInput);
    }

}

