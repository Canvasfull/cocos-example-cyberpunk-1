import { _decorator, Component, Node, ParticleSystem, game, Vec3 } from 'cc';
import { ActionActorEquip, key_type_boolean } from '../../core/action/action';
import { fx } from '../../core/effect/fx';
import { Msg } from '../../core/msg/msg';
import { ResCache } from '../../core/res/res-cache';
import { Actor } from './actor';
import { ActorAnimationGraph } from './actor-animation-graph';
import { ActorAnimationGraphGroup } from './actor-animation-graph-group';
import { BagItems } from './actor-bag';
import { geometry, PhysicsSystem, PhysicsRayResult } from 'cc';
import { ActorEquipBase } from './actor-equip-base';
import { calculateDamage } from './damage-core';
const { ccclass } = _decorator;

@ccclass('ActorEnemyGun')
export class ActorEnemyGun extends ActorEquipBase {

    onFire() {
        this._bagData!.bulletCount--;
        const forwardNode = this._actor!._forwardNode;
        const origin = forwardNode.worldPosition;
        const dir = forwardNode.forward;
        let ray = new geometry.Ray(origin.x, origin.y, origin.z, dir.x, dir.y , dir.z);
        const mask = 1 << 3 | 1 << 4;
        const distance = this._data.damage.distance;
        console.log(mask, distance);
        let hit:PhysicsRayResult | undefined;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, distance)) {
            hit = PhysicsSystem.instance.raycastClosestResult;
        }
        this.setWeaponTracer(hit, dir);
        calculateDamage(this._data, hit);
    }
    
}

