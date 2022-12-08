import { _decorator, Component, Node, geometry, PhysicsSystem, game } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { ActorEquipBase } from './actor-equip-base';
import { ActorPart } from './actor-part';
const { ccclass, property } = _decorator;

@ccclass('ActorShotgun')
export class ActorShotgun extends ActorEquipBase {

    onFire() {
        this._bagData.bulletCount--;
        const forwardNode = this._actor._forwardNode;
        const origin = forwardNode.worldPosition;
        const dir = forwardNode.forward;
        let ray = new geometry.Ray(origin.x, origin.y, origin.z, dir.x, dir.y , dir.z);
        const mask = 1 << 3;
        const distance = this._data.damage.distance;
        if (PhysicsSystem.instance.raycastClosest(ray, mask, distance)) {
            const res = PhysicsSystem.instance.raycastClosestResult;
            const hitName = res.collider.node.name;
            console.log(`handgun fire hit ${hitName}`);
            if (hitName.concat('actor')) {
                const actorPart = res.collider.node.getComponent(ActorPart);
                if (!actorPart) {
                    console.error(` damage part can not add actor part component. ${actorPart}`);
                }
                const actor = actorPart.actor;
                const damage = this._data.damage[hitName];
                if (damage === undefined) {
                    console.error(`hit part undefind ${hitName}`);
                }
                actor._data.hp -= damage;
                if (actor._data.hp <= 0) {
                    this._actor._data.hp = 1;
                    actor.do('dead'); 
                }
            }else if (hitName === 'col_brick') {

            }else if (hitName === 'col_metal') {

            }else{
                
            }

        }else{
            console.log('empty shoot.');
        }
    }

}
