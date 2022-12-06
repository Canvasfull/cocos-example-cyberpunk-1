import { Node, PhysicsRayResult, Vec3 } from "cc";
import { Sound } from "../../core/audio/sound";
import { fx } from "../../core/effect/fx";
import { Local } from "../../core/local/local";
import { Msg } from "../../core/msg/msg";
import { ActorPart } from "./actor-part";

export function calculateDamage(data:any, hit:PhysicsRayResult | undefined) {
    if(hit === undefined) {
        Msg.emit(
            'msg_tips', 
            `${Local.Instance.get('empty_use.')}`
        );
        return;
    }
    const node:Node = hit.collider.node;
    const hitPoint = hit.hitPoint;
    const hitName = node.name;
    console.log(`handgun fire hit ${hitName}`);
    const damage = data.damage;
    const actorPart = node.getComponent(ActorPart);
    if(actorPart) {
        const part_damage = damage[hitName];
        if(part_damage == undefined) throw new Error(`${node.name} node hit part undefine '${hitName}'`);

        const actor = actorPart.actor;
        if(actor === undefined) throw new Error(`${node.name} node hit part '${hitName}' undefine actor`);

        actor._data.hp -= part_damage;
        if(actor._data.hp <= 0) {
            actor._data.hp = 1;
            actor.do('dead');
        }else{
            actor.do('hit_gun')
            Msg.emit(
                'msg_tips', 
                `${Local.Instance.get('shoot_part')} ${hitName}`
            );
        }
        if(damage.fx_hit_body) fx.on(damage.fx_hit_body, hitPoint);
        if(damage.sfx_hit_body) Sound.on(damage.sfx_hit_body);
    }else if(hitName === 'col_brick') {
        if(damage.fx_hit_wall) fx.on(damage.fx_hit_wall, hitPoint);
        if(damage.sfx_hit_wall) Sound.on(damage.sfx_hit_wall);
    }else if (hitName === 'col_metal') {
        if(damage.fx_hit_wall) fx.on(damage.fx_hit_wall, hitPoint);
        if(damage.sfx_hit_wall) Sound.on(damage.sfx_hit_wall);
    }else{
        if(damage.fx_hit_wall) fx.on(damage.fx_hit_wall, hitPoint);
        if(damage.sfx_hit_wall) Sound.on(damage.sfx_hit_wall);
    }
}
