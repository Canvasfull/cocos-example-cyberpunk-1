import { _decorator, Component, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Brain } from '../../core/ai/brain';
const { ccclass, property } = _decorator;

@ccclass('ActorPiranha')
export class ActorPiranha extends ActorBase {

    _brain:Brain;

    start() {
        this.init('actor-piranha');
        this._brain = new Brain(this._data.brain, this);
    }

    update(deltaTime: number) {
        
    }

    //#region condition

    noFoundPlayer() {

    }

    foundPlayer() {

    }

    nearPlayer() {

    }

    canEatPlayer() {

    }

    fleePlayer() {

    }

    feedPlayer() {
        
    }

    //#endregion

    idle() {

    }

    move() {

    }

    jump() {

    }

    crossRoad() {

    }

    forcePrepareJump() {

    }


}

