import { Node, PhysicsRayResult, Vec3 } from "cc";
import { Sound } from "../../core/audio/sound";
import { fx } from "../../core/effect/fx";
import { Local } from "../../core/localization/local";
import { Msg } from "../../core/msg/msg";
import { ActorPart } from "./actor-part";
import { Actor } from "./actor";

export function calculateDamageNode(data:any, node:Node, hitPoint:Vec3) {
    const hitName = node.name.split('_')[0];
    let hitTag = `hit_${hitName}`;
    
    const damage = data.damage;
    const actorPart = node.getComponent(ActorPart);

    if(data.actor.isPlayer) Msg.emit('msg_stat_times', `enemy_fire`);

    if (actorPart) {
        const actorBodyName = actorPart.part;
        const part_damage = damage[actorBodyName];
        if (part_damage === undefined) throw new Error(`${node.name} node hit part undefine '${actorBodyName}'`);

        const actor = actorPart.actor;
        if (actor === undefined) throw new Error(`${node.name} node hit part '${actorBodyName}' undefine actor`);

        if(data.actor.isPlayer) {
            Msg.emit('msg_stat_times', `hit_${actorBodyName}`);
        }

        if(actor.isPlayer) {
            Msg.emit('msg_stat_times', `be_hit_${actorBodyName}`);
        }

        actor._data.hp -= part_damage;
        if (actor._data.hp <= 0) {
            actor._data.hp = 0;
            if(actor.isPlayer) Msg.emit('msg_stat_times', 'killed');
            actor.do('dead');
        }else{
            actor.do('hit_gun')
        }
        hitTag = 'hit_body';
    }
    calculateDamageView(damage[hitTag], hitPoint);
} 

export function calculateDamage(data:any, hit:PhysicsRayResult | undefined, shootActor:Actor | undefined) {

    if(shootActor?.isPlayer) Msg.emit('msg_stat_times', `enemy_fire`);

    if (hit === undefined) {
        Msg.emit(
            'msg_tips', 
            `${Local.Instance.get('hit_nothing')}`,
        );
        return;
    }
    const node:Node = hit.collider.node;
    const hitName = node.name.split('_')[0];
    let hitTag = `hit_${hitName}`;

    const damage = data.damage;
    const actorPart = node.getComponent(ActorPart);

    if (actorPart) {
        const actorBodyName = actorPart.part;
        const part_damage = damage[actorBodyName];
        if (part_damage === undefined) throw new Error(`${node.name} node hit part undefine '${actorBodyName}'`);

        const actor = actorPart.actor;
        if (actor === undefined) throw new Error(`${node.name} node hit part '${actorBodyName}' undefine actor`);

        if(shootActor?.isPlayer) {
            Msg.emit('msg_stat_times', `hit_${actorBodyName}`);
        }

        if(actor.isPlayer) {
            Msg.emit('msg_stat_times', `be_hit_${actorBodyName}`);
        }

        actor._data.hp -= part_damage;
        if (actor._data.hp <= 0) {
            actor._data.hp = 1;
            if(shootActor?.isPlayer) Msg.emit('msg_stat_times', 'killed');
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
    if (damage.fx) fx.on(damage.fx, hitPoint);
    if (damage.sfx) Sound.on(damage.sfx);
    if (damage.notify === undefined) {
        Msg.emit(
            'msg_tips', 
            `${Local.Instance.get(damage['notify'])}`
        ); 
    }
}
