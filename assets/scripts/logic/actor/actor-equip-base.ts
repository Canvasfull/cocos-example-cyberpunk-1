import { _decorator, Component, Node, ParticleSystem, game, Vec3, PhysicsRayResult } from 'cc';
import { ActionActorEquip, key_type_boolean } from '../../core/action/action';
import { Actor } from './actor';
import { ActorAnimationGraphGroup } from './actor-animation-graph-group';
import { BagItems } from './actor-bag';
import { UtilNode } from '../../core/util/util';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('ActorEquipBase')
export class ActorEquipBase extends Component {

    point_shoot:Node | undefined;

    _animationGraph:ActorAnimationGraphGroup | undefined;

    _view:Node | undefined;

    _bagData:BagItems | undefined;

    _data:{ [key:string]:any } = {};

    _action: ActionActorEquip | undefined;

    _actor: Actor | undefined;

    isPlayer = false;

    _muzzleNode:Node | undefined;

    __preload() {
        this.point_shoot = this.node.getChildByName('point_shoot')!;
        this._animationGraph = this.addComponent(ActorAnimationGraphGroup)!;
        this._muzzleNode = UtilNode.find(this.node, 'fx_muzzle');
        this._view = this.node.getChildByName('view')!;
        if (this.point_shoot === undefined || this._animationGraph === undefined || this._view === undefined) {
            throw new Error(`${this.node.name} ActorEquipBase preload init error: may be lose point_shoot or animation graph or view node.`);
        }

        this.node.on('do', this.do, this);
        this.node.on('init', this.init, this);
    }

    init(bagData: BagItems) {
        this._actor = bagData.actor;
        this._bagData = bagData;
        this._data = this._bagData.data;
        this._action = new ActionActorEquip(this._data.action, this);
        this._bagData.lastUseTime = game.totalTime/1000;
        this.isPlayer = this._actor.isPlayer;
    }

    onDestroy() {
        this.node.off('do', this.do, this);
        this.node.off('init', this.init, this);
    }

    do (name: string) {
        if (this._action) {
            if (name === 'fire' && !this.checkUse()) return;
            this._action.on(name);
        } 
    }

    update(deltaTime: number) {
        this._action?.update(deltaTime);
    }

    setActive (data: key_type_boolean) {
        const activeNode = this.node.getChildByName(data.key);
        if (activeNode) activeNode.active = data.value;
        else console.warn(` You want set undefined node active. ${this.node?.name}/${data.key}`);
    }

    hiddenNode() {
        this.node.active = false;
    }

    setFx (data: key_type_boolean) {
        const pNode = UtilNode.find(this.node, data.key);
        var particles = pNode?.getComponentsInChildren(ParticleSystem);
        if (particles === undefined) {
            console.warn(` effect can not find ${data}`);
            return;
        }
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.loop = data.value;
            if (data.value) p.play();
        }
    }

    onFx (data: string) {
        console.log(' ------ on fx', data);
        const pNode = UtilNode.find(this.node, data);
        var particles = pNode?.getComponentsInChildren(ParticleSystem);
        if (particles === undefined) {
            console.warn(` effect can not find ${data}`);
            return;
        }
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.play();
        }
    }

    setWeaponTracer(hit:PhysicsRayResult | undefined, dir:Vec3) {
        const origin = this._muzzleNode!.worldPosition;
        let hitPosition:Vec3 | undefined;
        if(hit?.hitPoint !== undefined) {
            hitPosition = hit.hitPoint;
        }else{
            hitPosition = origin.clone();
            hitPosition.add3f(dir.x * 100, dir.y * 100, dir.z * 100);
        }
        Msg.emit('msg_set_tracer', { start:origin, end:hitPosition});
    }

    actionEnd () {
        var info = `actor info:\n`;
    }

    checkUse():boolean {
        // Check bullet count.
        if (this._bagData!.bulletCount <= 0 && this._bagData!.data.bullet_count !== -1) {
            this.do('fire_empty');
            return false;
        }
        const lastUseTime = this._bagData!.lastUseTime;
        const timeSpace = (game.totalTime - lastUseTime)/1000;
        return timeSpace >= this._data.damage.cooling;

    }

    updateCooling() {
        this._bagData!.lastUseTime = game.totalTime;
    }

    onReload() {
        this._bagData!.bulletCount = 10;
    }

    onUse() {}

}

