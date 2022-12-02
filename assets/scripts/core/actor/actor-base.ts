import { _decorator, Component, Node, AnimationComponent, game, SkeletalAnimation, ParticleSystem, RigidBody, Vec3 } from 'cc';
import { ActorAnimationGraph } from '../../logic/actor/actor-animation-graph';
import { ActorBuff } from '../../logic/actor/actor-buff';
import { DamageData } from '../../logic/actor/actor-interface';
import { ActionActor, key_type_boolean } from '../action/action';
import { Local } from '../local/local';
import { Msg } from '../msg/msg';
import { ResCache } from '../res/res-cache';
import { u3 } from '../util/util';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = actor_base
 * DateTime = Tue Mar 29 2022 13:50:23 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = actor-base.ts
 * FileBasenameNoExtension = actor-base
 * URL = db://assets/scripts/core/actor/actor-base.ts
 * ManualUrl = https://docs.cocos.com/creator/3.5/manual/en/
 *
 */

@ccclass('ActorBase')
export class ActorBase extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    _anim: SkeletalAnimation = Object.create(null);
    _animg: ActorAnimationGraph = Object.create(null);
    _action: ActionActor = null;
    _data = Object.create(null);
    _updates: Function[] = [];

    _dir = new Vec3(0, 0, 0);
    _curdir = new Vec3(0, 0, 0);
    
    _view: Node = Object.create(null);
    _actionUpdate = () => { };

    _angle_head = 0;
    _angle_vertical = 0;
    _angle_side = 1;

    _groupIndex = -1;

    init (actionName: string) {
        Object.assign(this._data, ResCache.Instance.getJson(actionName).json);
        this._action = new ActionActor(this._data.action, this);
        this.onBind();
        //console.log(this);
    }

    onBind () {
        this.node.on('do', this.do, this);
    }

    offBind () {
        this.node.off('do', this.do, this);
    }

    onUpdate () { }

    offUpdate () {
        this._updates = [];
    }

    updateAttribute () { }

    onDestroy () {
        this.offBind();
    }

    do (name: string) {
        if (this._action) this._action.on(name);
    }

    update (deltaTime: number) {
        //     // [4]
        if (this._action) this._action.update(deltaTime);
        var count = this._updates.length;
        for (var i = 0; i < count; i++)
            this._updates[i](deltaTime);
    }

    setActive (data: key_type_boolean) {
        var active_node = this.node.getChildByName(data.key);
        active_node.active = data.value;
    }

    setFx (data: key_type_boolean) {
        var pnode = this.node.getChildByName(data.key);
        var particles = pnode?.getComponentsInChildren(ParticleSystem);
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.loop = data.value;
            if (data.value) p.play();
        }
    }

    onFx (data: string) {
        var pnode = this.node.getChildByName(data);
        var particles = pnode?.getComponentsInChildren(ParticleSystem);
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.play();
        }
    }

    actionEnd () {
        var info = `actor info:\n`;
        info += `is_ground:${this._data.is_ground}\nis_ingrass:${this._data.is_ingrass}`;
    }

    setDir(dir:Vec3) {
        u3.c(this._dir, dir);
    }

    onDead() {

        if(this._groupIndex != -1) {
            Msg.emit('msg_remove_enemy', this._groupIndex);
            Msg.emit(
                'msg_tips', 
                `${Local.Instance.get('killed one.')}`
            );
        }

        this.node?.destroy();
    }

}