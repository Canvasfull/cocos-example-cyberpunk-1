import { _decorator, Component, Node } from 'cc';
import { ActorEquipBase } from './actor-equip-base';
import { IActorEquip } from './actor-interface';
const { ccclass, property } = _decorator;

@ccclass('ActorCrossbow')
export class ActorCrossbow extends ActorEquipBase {

    _pointShoot:Node | null | undefined;

    start() {
        this._pointShoot = this.node.getChildByName('point_shoot');
    }

    onDestroy() {
    }

    update(deltaTime: number) {
        
    }

}

