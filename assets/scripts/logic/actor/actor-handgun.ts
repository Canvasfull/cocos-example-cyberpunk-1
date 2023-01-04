import { _decorator, Component, Node, geometry, PhysicsSystem, game, PhysicsRayResult, Vec3 } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { fx } from '../../core/effect/fx';
import { Local } from '../../core/localization/local';
import { Msg } from '../../core/msg/msg';
import { ActorEquipBase } from './actor-equip-base';
import { ActorPart } from './actor-part';
import { calculateDamage } from './damage-core';
const { ccclass, property } = _decorator;

@ccclass('ActorHandgun')
export class ActorHandgun extends ActorEquipBase {

    onFire() {
        this._bagData!.bulletCount--;
        const forwardNode = this._actor!._forwardNode;
        const origin = forwardNode.worldPosition;
        const dir = forwardNode.forward;
        let ray = new geometry.Ray(origin.x, origin.y, origin.z, dir.x, dir.y , dir.z);
        const mask = 1 << 3 | 1 << 4;
        const distance = this._data.damage.distance;
        let hitPosition:Vec3 | undefined;
        console.log(mask, distance);
        let hit:PhysicsRayResult | undefined;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, distance)) {
            hit = PhysicsSystem.instance.raycastClosestResult;
        }
        if(hit?.hitPoint !== undefined) {
            hitPosition = hit.hitPoint
        }else{
            let hitPosition = origin.clone();
            hitPosition.add3f(dir.x * 100, dir.y * 100, dir.z * 100);
        }
        Msg.emit('msg_set_tracer', { start:origin, end:hitPosition});
        calculateDamage(this._data, hit);
       
    }

}
