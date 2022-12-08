import { _decorator, Component, Node } from 'cc';
import { ActorInput } from '../../logic/actor/actor-input';
import { IActorInput } from './IActorInput';

const { ccclass, property } = _decorator;

@ccclass('InputBase')
export class InputBase extends Component {

    _actorInput:IActorInput | undefined | null;

    onStart() {
    }

    onEnd() {}

    onEnable() {
        this._actorInput = this.node.parent?.getComponent(ActorInput);
        if (this._actorInput === undefined || this._actorInput === null) {
            throw new Error(`Not find Actor Input. node is : ${this.node.name}`);
        }
    }

}

