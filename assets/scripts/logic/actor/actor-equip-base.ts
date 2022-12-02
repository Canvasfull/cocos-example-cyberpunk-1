import { _decorator, Component, Node, ParticleSystem, game, Vec3 } from 'cc';
import { ActionActorEquip, key_type_boolean } from '../../core/action/action';
import { fx } from '../../core/effect/fx';
import { Msg } from '../../core/msg/msg';
import { ResCache } from '../../core/res/res-cache';
import { Actor } from './actor';
import { ActorAnimationGraphGroup } from './actor-animation-graph-group';
import { BagItems } from './actor-bag';
import { IActorEquip } from './actor-interface';
import { ActorPart } from './actor-part';
const { ccclass, property } = _decorator;

@ccclass('ActorEquipBase')
export class ActorEquipBase extends Component {

    point_shoot:Node;

    _animg:ActorAnimationGraphGroup;

    _view:Node;

    _bagData:BagItems;

    _data = Object.create(null);

    _action: ActionActorEquip;

    _actor: Actor;

    __preload() {
        this.point_shoot = this.node.getChildByName('point_shoot');
        this._animg = this.addComponent(ActorAnimationGraphGroup);
        this._view = this.node.getChildByName('view');
        this.node.on('do', this.do, this);
        this.node.on('init', this.init, this);
    }

    init(bagData: BagItems) {
        this._actor = bagData.actor;
        this._bagData = bagData;
        this._data = this._bagData.data;
        this._action = new ActionActorEquip(this._data.action, this);
        this._bagData.lastUseTime = game.totalTime/1000;
    }

    onDesttoy() {
        this.node.off('do', this.do, this);
        this.node.off('init', this.init, this);
    }

    do (name: string) {
        if (this._action) {
            if(name === 'fire' && !this.checkUse()) return;
            this._action.on(name);
        } 
    }

    update(deltaTime: number) {
        this._action.update(deltaTime);
    }

    setActive (data: key_type_boolean) {
        var active_node = this.node.getChildByName(data.key);
        active_node.active = data.value;
    }

    setFx (data: key_type_boolean) {
        var pnode = this.node.getChildByName(data.key);
        var particles = pnode?.getComponentsInChildren(ParticleSystem);
        if(particles === undefined) {
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
        var pnode = this.node.getChildByName(data);
        var particles = pnode?.getComponentsInChildren(ParticleSystem);
        if(particles === undefined) {
            console.warn(` effect can not find ${data}`);
            return;
        }
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.play();
        }
    }

    actionEnd () {
        var info = `actor info:\n`;
    }

    checkUse():boolean {
        // Check bullet count.
        if(this._bagData.bulletCount <= 0 && this._bagData.data.bullet_count !== -1) {
            this.do('fire_empty');
            return false;
        }
        const lastUseTime = this._bagData.lastUseTime;
        const timeSpace = (game.totalTime - lastUseTime)/1000;
        return timeSpace >= this._data.damage.cooling;

    }

    updateCooding() {
        this._bagData.lastUseTime = game.totalTime;
    }

    onUse() {}

}

