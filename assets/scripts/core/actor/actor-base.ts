import { _decorator, Component, Node, SkeletalAnimation, ParticleSystem, Vec3 } from 'cc';
import { ActorAnimationGraph } from '../../logic/actor/actor-animation-graph';
import { ActionActor, key_type_boolean } from '../action/action';
import { KeyAnyType } from '../../logic/data/game-type';
import { Local } from '../localization/local';
import { Msg } from '../msg/msg';
import { ResCache } from '../res/res-cache';
import { u3 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('ActorBase')
export class ActorBase extends Component {

    _anim: SkeletalAnimation = Object.create(null);
    _animationGraph: ActorAnimationGraph = Object.create(null);
    _action: ActionActor | undefined;
    _data:KeyAnyType = {};
    _updates: Function[] = [];
    _dir = new Vec3(0, 0, 0);
    _curDir = new Vec3(0, 0, 0);
    _view: Node = Object.create(null);
    _angleHead = 0;
    _angleVertical = 0;
    _groupIndex = -1;
    _actionUpdate = () => { };

    init (actionName: string) {
        Object.assign(this._data!, ResCache.Instance.getJson(actionName).json);
        this._action = new ActionActor(this._data.action, this);
        this.onBind();
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
        if (this._action) this._action.update(deltaTime);
        var count = this._updates.length;
        for (var i = 0; i < count; i++)
            this._updates[i](deltaTime);
    }

    setActive (data: key_type_boolean) {
        const activeNode = this.node.getChildByName(data.key);
        if (activeNode) activeNode.active = data.value;
        else console.warn(` You want set undefined node active. ${this.node?.name}/${data.key}`);
    }

    setFx (data: key_type_boolean) {
        const pNode = this.node.getChildByName(data.key);
        const particles = pNode?.getComponentsInChildren(ParticleSystem);
        if (particles === undefined) return;
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.loop = data.value;
            if (data.value) p.play();
        }
    }

    onFx (data: string) {
        const pNode = this.node.getChildByName(data);
        const particles = pNode?.getComponentsInChildren(ParticleSystem);
        if (particles === undefined) return;
        for (var i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.play();
        }
    }

    actionEnd () {
    }

    setDir(dir:Vec3) {
        u3.c(this._dir, dir);
    }

    onDead() {

        if (this._groupIndex !== -1) {
            Msg.emit('msg_remove_enemy', this._groupIndex);
            Msg.emit(
                'msg_tips', 
                `${Local.Instance.get('killed_one')}`
            );
        }

        this.node?.destroy();
    }

}