import { Node, PhysicsRayResult, Vec3 } from "cc";
import { Sound } from "../../core/audio/sound";
import { fx } from "../../core/effect/fx";
import { Local } from "../../core/localization/local";
import { Msg } from "../../core/msg/msg";
import { ActorPart } from "./actor-part";

export function calculateDamage(data:any, hit:PhysicsRayResult | undefined) {
    if (hit === undefined) {
        Msg.emit(
            'msg_tips', 
            `${Local.Instance.get('hit_nothing')}`,
        );
        return;
    }
    const node:Node = hit.collider.node;
    let hitTag = `hit_${node.name}`;
    const damage = data.damage;
    const actorPart = node.getComponent(ActorPart);
    if (actorPart) {
        const actorBodyName = node.name;
        const part_damage = damage[actorBodyName];
        if (part_damage === undefined) throw new Error(`${node.name} node hit part undefine '${actorBodyName}'`);

        const actor = actorPart.actor;
        if (actor === undefined) throw new Error(`${node.name} node hit part '${actorBodyName}' undefine actor`);

        actor._data.hp -= part_damage;
        if (actor._data.hp <= 0) {
            actor._data.hp = 1;
            actor.do('dead');
        }else{
            actor.do('hit_gun')
        }
        hitTag = 'hit_body';
    }
    calculateDamageView(damage[hitTag], hit.hitPoint);
}

function calculateDamageView(damage:Record<string, any> | undefined, hitPoint:Vec3) {
    if (damage === undefined) return;
    if (damage.fx_hit_wall) fx.on(damage.fx_hit_wall, hitPoint);
    if (damage.sfx_hit_wall) Sound.on(damage.sfx_hit_wall);
    if (damage.notify === undefined) {
        Msg.emit(
            'msg_tips', 
            `${Local.Instance.get(damage['notify'])}`
        ); 
    }
}
