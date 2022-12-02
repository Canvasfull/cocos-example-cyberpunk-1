import { randomRange, randomRangeInt, _decorator } from 'cc';
import { UI } from '../ui/ui';
import { Sound } from '../audio/sound';
import { Msg } from '../msg/msg';
import { ResCache } from '../res/res-cache';
import { GScene } from '../scene/g-scene';
import { Queue } from '../util/data-structure';
import { Res } from '../res/res';
import { Actor } from '../../logic/actor/actor';
import { ActorBase } from '../actor/actor-base';
import { fun } from '../util/fun';
import { ActorEquipBase } from '../../logic/actor/actor-equip-base';

/**
 * Predefined variables
 * Name = action
 * DateTime = Mon Jan 17 2022 13:54:47 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = action.ts
 * FileBasenameNoExtension = action
 * URL = db://assets/scripts/core/action/action.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
export class Action {

    _data: {} = Object.create(null);
    _time: number = 0;
    _index: number = 0;
    _queue: Queue<ActionGroup> = Object.create(null);
    _act: ActionGroup = null;

    constructor (name: string) {
        this._data = ResCache.Instance.getJson(name).json;
        this._queue = new Queue(5);
    }

    public on (name: string): void {
        this.push(name, 'start');
        Msg.emit('msg_stat_times', name);
    }

    public off (name: string): void {
        this.push(name, 'end');
    }

    public push (name: string, state: string) {
        //console.log('push ----------- action:', name, ' state:', state);
        var action = this._data[name];
        if (action == undefined) {
            console.warn('Undefined action:', name);
            return;
        }
        var info: ActionInfo[] = action[state];
        let group = new ActionGroup(info);
        this._queue.push(group);
    }

    public pop () {
        this._act = this._queue.pop();
        //console.log('pop -------- action:', this._act);
    }

    public update (deltaTime: number) {
        if (GScene.isloadScene) return;
        if (this._act) {
            this._act.time += deltaTime;
            var cur = this._act.data[this._act.idx];
            if (this._act.time >= cur.time) {
                UtilAction.do(cur.name, cur.data);
                this._act.idx += 1;
                if (this._act.idx >= this._act.data.length) {
                    this._act = null;
                }
            }
        } else {
            if (!this._queue.empty()) this.pop();
        }
    }
}

export class ActionParallel {

    _data: {} = Object.create(null);
    _time: number = 0;
    _index: number = 0;
    _act: ActionGroup = null;
    _actions: ActionGroup[] = [];

    constructor (name: string) {
        this._data = ResCache.Instance.getJson(name).json;
    }

    public on (name: string): void {
        this.push(name, 'start');
    }

    public off (name: string): void {
        this.push(name, 'end');
    }

    public push (name: string, state: string) {
        var action = this._data[name];
        if (action == undefined) {
            console.error('Undefined action:', name);
            return;
        }
        var info: ActionInfo[] = action[state];
        let group = new ActionGroup(info);
        this._actions.push(group);
    }

    public update (deltaTime: number) {
        var count = this._actions.length;
        if (count <= 0) return;
        for (var i = count - 1; i >= 0; i--) {
            var element = this._actions[i];
            element.time += deltaTime;
            var cur = element.data[element.idx];
            if (element.time >= cur.time) {
                UtilAction.do(cur.name, cur.data);
                element.idx += 1;
                if (element.idx >= element.data.length) {
                    this._actions.splice(i, 1);
                }
            }
        }
    }
}

export class ActionActor extends Action {

    _actor: ActorBase;

    constructor (name: string, actor: ActorBase) {
        super(name);
        this._actor = actor;
    }

    public on (name: string): void {
        super.on(name);
    }

    public update (deltaTime: number) {
        if (GScene.isloadScene) return;
        if (this._act) {
            this._act.time += deltaTime;
            var length = this._act.data.length;
            for (var i = this._act.idx; i < length; i++)
                if (!this.checkRunAction()) break;
        } else {
            if (!this._queue.empty()) this.pop();
        }
    }

    public checkRunAction () {
        let cur = this._act.data[this._act.idx];
        if (this._act.time >= cur.time) {
            if (cur.delay > 0) {
                fun.delay(() => { UtilAction.do(cur.name, cur.data, this._actor); }, cur.delay);
            } else {
                UtilAction.do(cur.name, cur.data, this._actor);
            }
            this._act.idx += 1;
            if (this._act.idx >= this._act.data.length) {
                this._act = null;
            }
            this._actor.actionEnd();
            return true;
        }
        return false;
    }

}

export class ActionActorEquip extends Action {

    _actor: ActorEquipBase;

    constructor (name: string, actor: ActorEquipBase) {
        super(name);
        this._actor = actor;
    }

    public on (name: string): void {
        super.on(name);
    }

    public update (deltaTime: number) {
        if (GScene.isloadScene) return;
        if (this._act) {
            this._act.time += deltaTime;
            var length = this._act.data.length;
            for (var i = this._act.idx; i < length; i++)
                if (!this.checkRunAction()) break;
        } else {
            if (!this._queue.empty()) this.pop();
        }
    }

    public checkRunAction () {
        let cur = this._act.data[this._act.idx];
        if (this._act.time >= cur.time) {
            if (cur.delay > 0) {
                fun.delay(() => { UtilActionEquip.do(cur.name, cur.data, this._actor); }, cur.delay);
            } else {
                UtilActionEquip.do(cur.name, cur.data, this._actor);
            }
            this._act.idx += 1;
            if (this._act.idx >= this._act.data.length) {
                this._act = null;
            }
            this._actor.actionEnd();
            return true;
        }
        return false;
    }

}

export class ActionQueue extends Action {

    public update (deltaTime: number) {
        if (GScene.isloadScene) return;
        if (this._act) {
            this._act.time += deltaTime;
            let cur = this._act.data[this._act.idx];
            if (this._act.time >= cur.time) {
                UtilAction.do(cur.name, cur.data);
                this._act.idx += 1;
                if (this._act.idx >= this._act.data.length) {
                    this._act = null;
                }
            }
        } else {
            if (!this._queue.empty()) this.pop();
        }
    }
}

interface ActionInfo {
    time: number;
    delay: number;
    name: string;
    data: string;
}

export class ActionGroup {
    public data: ActionInfo[] = null;
    public time: number = 0;
    public idx: number = 0;

    constructor (info: ActionInfo[]) {
        this.data = info;
    }
}

export type key_type = { key: string, value: boolean | string | number | any };
export type key_type_boolean = { key: string, value: boolean };
export type key_type_string = { key: string, value: string };
export type key_type_number = { key: string, value: number };
export type action_type = number | boolean | string | key_type_boolean | key_type_number | key_type_string;

export class UtilAction {

    public static do (name: string, key: action_type, actor: ActorBase = null) {
        //console.log('actor:',actor?.node.name,' --- do action:' + name + ' key:' + key);
        var action = this[name];
        if (action) {
            action(key, actor);
        } else {
            console.warn('Not defined action:' + name);
        }
    }

    public static on_check_preload() {
        if(GScene.isPreload)
            GScene.isloadScene = true;
    }

    public static on_scene (key: string) {
        //console.log('on_scene:' + key);
        GScene.Load(key, () => { });
    }

    public static off_scene (key: string) {
        //console.log('off_scene:' + key);
    }

    public static on_ui (key: string) {
        UI.Instance.on(key);
    }

    public static off_ui (key: string) {
        UI.Instance.off(key);
    }

    public static on_sfx (key: string) {
        Sound.on(key);
    }

    public static off_sfx (key: string) {
        Sound.off(key);
    }

    public static on_sfxing(key: string, volume = 1) {
        Sound.oning(key, volume);
    }

    public static off_sfxing(key:number) {
        Sound.offing(key);
    }

    public static on_bgm (key: string) {
        Sound.onBGM(key);
    }

    public static off_bgm (key: string) {
        Sound.offBGM(key);
    }

    public static on_msg (key: string) {
        Msg.emit(key);
    }

    public static on_msg_num (data: key_type_number, actor: Actor) {
        Msg.emit(data.key, data.value);
    }

    public static on_msg_str (data: key_type_string ) {
        Msg.emit(data.key, data.value);
    }

    public static on_inst_scene (key: string ) {
        var asset = ResCache.Instance.getPrefab(key);
        var obj = Res.inst(asset);
        obj.setPosition(0, 0, 0);
    }

    public static on_inst (key: string, actor: Actor) {

        var asset = ResCache.Instance.getPrefab(key);
        var obj = Res.inst(asset);
        if (actor != undefined && actor._view != null) {
            obj.parent = actor._view;
            obj.setPosition(0, 0, 0);
        }

        //console.log('on inst key:', key, obj.parent.name, obj.scale, obj.position, obj.angle);

        /*
        Res.loadPrefab(key, (err, asset) => {
            if (asset) {
                var obj = Res.inst(asset);
                if (actor != undefined && actor._view != null) {
                    obj.parent = actor._view;
                    obj.setPosition(0, 0, 0);
                }
                console.log('inst:', obj.name);
            }
        });
        */
    }

    public static off_inst (key: string, actor: ActorBase) {

    }

    public static on_inst_fx(data:any, actor: ActorBase) {
        var res = data.res;
        var bone = data.bone;
        var asset = ResCache.Instance.getPrefab(res);
        var obj = Res.inst(asset);
        if (actor != undefined && actor._view != null) {
            var bone_node = actor.node.getChildByName(bone);
            obj.parent = bone_node;
            obj.setPosition(0, 0, 0);
        }
    }


    public static off_inst_fx(data:any, actor: ActorBase) {
        var res = data.res;
        var bone = data.bone;
        if (actor != undefined && actor._view != null) {
            var off_fx = actor.node.getChildByName(bone).getChildByName(res);
            if(off_fx) off_fx.emit('setDestroy'); 
        } 
    }

    public static on_active (data: key_type_boolean, actor: ActorBase) {
        actor.setActive(data);
    }

    public static on_fx (data: string, actor: ActorBase) {
        actor.onFx(data);
    }

    public static on_buff(data: string, actor: ActorBase) {
        //actor.onBuff(data);
    }

    public static set_fx (data: key_type_boolean, actor: ActorBase) {
        actor.setFx(data);
    }

    public static on_ani (key: string, actor: ActorBase) {
        if (actor._anim)
            actor._anim.play(key);
        else
            console.log('Not register SkeletalAniamtion');
    }

    public static on_anig (data: any, actor: ActorBase) {
        if (actor._animg) {
            var _graph = actor._animg._graph;
            //console.log('on anig do:', data.key, data.value, _graph.getCurrentStateStatus(0));
            actor._animg.play(data.key, data.value);
        } else
            console.log('Not register animationGraph.');
    }

    public static on_set (data: key_type, actor: ActorBase) {
        //console.log('on set ------------- ',data.key,data.value);
        actor._data[data.key] = data.value;
    }

    public static off_set (key: string, actor: ActorBase) {
        actor._data[key] = false;
    }

    public static on_add (data: any, actor: ActorBase) {
        console.log(data);
        for (let k in data) {
            console.log(k);
            actor._data[k] += data[k];
        }
    }

    public static on_mul (data: any, actor: ActorBase) {
        console.log(data);
        for (let k in data) {
            console.log(k);
            actor._data[k] *= data[k];
        }
    }

    public static on_call (key: string, actor: ActorBase) {
        actor[key]();
    }
}

export class UtilActionEquip {

    public static do (name: string, key: action_type, actor: ActorEquipBase = null) {
        //console.log('actor:',actor?.node.name,' --- do action:' + name + ' key:' + key);
        var action = this[name];
        if (action) {
            action(key, actor);
        } else {
            console.warn('Not defined action:' + name);
        }
    }

    public static on_check_preload() {
        if(GScene.isPreload)
            GScene.isloadScene = true;
    }

    public static on_scene (key: string) {
        //console.log('on_scene:' + key);
        GScene.Load(key, () => { });
    }

    public static off_scene (key: string) {
        //console.log('off_scene:' + key);
    }

    public static on_ui (key: string) {
        UI.Instance.on(key);
    }

    public static off_ui (key: string) {
        UI.Instance.off(key);
    }

    public static on_sfx (key: string) {
        Sound.on(key);
    }

    public static on_sfx_random (data: key_type_number) {
        const key = data.key;
        const range = data.value;
        const sfx = `${key}_${randomRangeInt(0, range)}`;
        console.log(sfx);
        Sound.on(sfx);
    }

    public static off_sfx (key: string) {
        Sound.off(key);
    }

    public static on_sfxing(key: string, volume = 1) {
        Sound.oning(key, volume);
    }

    public static off_sfxing(key:number) {
        Sound.offing(key);
    }

    public static on_bgm (key: string) {
        Sound.onBGM(key);
    }

    public static off_bgm (key: string) {
        Sound.offBGM(key);
    }

    public static on_msg (key: string) {
        Msg.emit(key);
    }

    public static on_msg_num (data: key_type_number, actor: Actor) {
        Msg.emit(data.key, data.value);
    }

    public static on_msg_str (data: key_type_string ) {
        Msg.emit(data.key, data.value);
    }

    public static on_inst_scene (key: string ) {
        var asset = ResCache.Instance.getPrefab(key);
        var obj = Res.inst(asset);
        obj.setPosition(0, 0, 0);
    }

    public static on_inst (key: string, actor: Actor) {

        var asset = ResCache.Instance.getPrefab(key);
        var obj = Res.inst(asset);
        if (actor != undefined && actor._view != null) {
            obj.parent = actor._view;
            obj.setPosition(0, 0, 0);
        }
    }

    public static off_inst (key: string, actor: ActorEquipBase) {

    }

    public static on_inst_fx(data:any, actor: ActorEquipBase) {
        var res = data.res;
        var bone = data.bone;
        var asset = ResCache.Instance.getPrefab(res);
        var obj = Res.inst(asset);
        if (actor != undefined && actor._view != null) {
            var bone_node = actor.node.getChildByName(bone);
            obj.parent = bone_node;
            obj.setPosition(0, 0, 0);
        }
    }


    public static off_inst_fx(data:any, actor: ActorEquipBase) {
        var res = data.res;
        var bone = data.bone;
        if (actor != undefined && actor._view != null) {
            var off_fx = actor.node.getChildByName(bone).getChildByName(res);
            if(off_fx) off_fx.emit('setDestroy'); 
        } 
    }

    public static on_active (data: key_type_boolean, actor: ActorEquipBase) {
        actor.setActive(data);
    }

    public static on_fx (data: string, actor: ActorEquipBase) {
        actor.onFx(data);
    }

    public static on_buff(data: string, actor: ActorEquipBase) {
        //actor.onBuff(data);
    }

    public static set_fx (data: key_type_boolean, actor: ActorEquipBase) {
        actor.setFx(data);
    }

    public static on_anig (data: any, actor: ActorEquipBase) {
        if (actor._animg) {
            //console.log('on anig do:', data.key, data.value, _graph.getCurrentStateStatus(0));
            actor._animg.play(data.key, data.value);
        } else
            console.log('Not register animationGraph.');
    }

    public static on_set (data: key_type, actor: ActorEquipBase) {
        //console.log('on set ------------- ',data.key,data.value);
        actor._data[data.key] = data.value;
    }

    public static off_set (key: string, actor: ActorEquipBase) {
        actor._data[key] = false;
    }

    public static on_add (data: any, actor: ActorEquipBase) {
        console.log(data);
        for (let k in data) {
            console.log(k);
            actor._data[k] += data[k];
        }
    }

    public static on_mul (data: any, actor: ActorEquipBase) {
        console.log(data);
        for (let k in data) {
            console.log(k);
            actor._data[k] *= data[k];
        }
    }

    public static on_call (key: string, actor: ActorEquipBase) {
        actor[key]();
    }
}