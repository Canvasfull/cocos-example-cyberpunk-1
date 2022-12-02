import { _decorator, Component, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
const { ccclass, property } = _decorator;

@ccclass('ActorWorld')
export class ActorWorld extends ActorBase {

    
    start() {
        this.init('data-actor-world');
    }

    update(deltaTime: number) {
    }

}

