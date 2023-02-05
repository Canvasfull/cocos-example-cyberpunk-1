import { _decorator, geometry, PhysicsSystem, PhysicsRayResult } from 'cc';
import { ActorEquipBase } from './actor-equip-base';
import { calculateDamage } from './damage-core';
import { UtilVec3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

let ray = new geometry.Ray();

@ccclass('ActorMachineGun')
export class ActorMachineGun extends ActorEquipBase {
    
    onFire() {
        this._bagData!.bulletCount--;
        const forwardNode = this._actor!._forwardNode!;
        const origin = forwardNode.worldPosition;
        const dir = forwardNode.forward;
        UtilVec3.copy(ray.o, origin);
        UtilVec3.copy(ray.d, dir);
        const distance = this._data.damage.distance;
        let hit:PhysicsRayResult | undefined;
        if (PhysicsSystem.instance.raycastClosest(ray, this.mask, distance)) {
            hit = PhysicsSystem.instance.raycastClosestResult;
        }
        this.showTracer(hit, dir);
        calculateDamage(this._data, hit, this._actor);
    }

}

