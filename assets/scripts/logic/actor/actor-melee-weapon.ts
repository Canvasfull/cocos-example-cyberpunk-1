import { _decorator, geometry, PhysicsSystem, PhysicsRayResult } from 'cc';
import { ActorEquipBase } from './actor-equip-base';
import { calculateDamage } from './damage-core';
const { ccclass, property } = _decorator;

@ccclass('ActorMeleeWeapon')
export class ActorMeleeWeapon extends ActorEquipBase {

    onFire() {
        this._bagData!.bulletCount--;
        const forwardNode = this._actor!._forwardNode!;
        const origin = forwardNode.worldPosition;
        const dir = forwardNode.forward;
        let ray = new geometry.Ray(origin.x, origin.y, origin.z, dir.x, dir.y , dir.z);
        const mask = 1 << 3 | 1 << 4;
        const distance = this._data.damage.distance;
        let hit:PhysicsRayResult | undefined = undefined;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, distance)) {
            hit = PhysicsSystem.instance.raycastClosestResult;
        }
        calculateDamage(this._data, hit, this._actor);
    }

}

