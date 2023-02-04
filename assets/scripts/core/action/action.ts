/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { randomRangeInt, _decorator } from 'cc';
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
import { Level } from '../../logic/level/level';

export class Action {

    _data : { [key:string]: any } = {};
    _time: number = 0;
    _index: number = 0;
    _queue: Queue<ActionGroup> = Object.create(null);
    _act: ActionGroup | undefined;

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
        var action = this._data[name];
        if (action === undefined) {
            console.warn('Undefined action:', name);
            return;
        }
        var info: ActionInfo[] = action[state];
        let group = new ActionGroup(info);
        this._queue.push(group);
    }

    public pop () {
        this._act = this._queue.pop();
    }

    public update (deltaTime: number) {
        if (GScene.isLoadScene) return;
        if (this._act) {
            this._act.time += deltaTime;
            const cur = this._act?.data[this._act.idx]!;
            if (cur === undefined || this._act === undefined) {
                throw new Error(`Error actor action index: ${this._act?.idx}`);
            }
            if (this._act.time >= cur.time) {
                UtilAction.do(cur.name, cur.data);
                this._act.idx += 1;
                if (this._act.idx >= this._act.data.length) {
                    this._act = undefined;
                }
            }
        } else {
            if (!this._queue.empty()) this.pop();
        }
    }
}

export class ActionParallel {

    _data : { [key:string]: any } = {};
    _time: number = 0;
    _index: number = 0;
    _act: ActionGroup | undefined;
    _actions: ActionGroup[] = [];

    constructor (name: string) {
        this._data = ResCache.Instance.getJson(name).json;
    }

    public on (name: string): void {
        this.push(name, 'start');
        Msg.emit('msg_stat_times', name);
    }

    public off (name: string): void {
        this.push(name, 'end');
    }

    public push (name: string, state: string) {
        var action = this._data[name];
        if (action === undefined) {
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
        Msg.emit('msg_stat_times', name);
    }

    public update (deltaTime: number) {
        if (GScene.isLoadScene) return;
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
        const cur = this._act?.data[this._act.idx]!;
        if (cur === undefined || this._act === undefined) {
            throw new Error(`Error actor action index: ${this._act?.idx}`);
        }
        if (this._act.time >= cur.time) {
            if (cur.delay > 0) {
                fun.delay(() => { UtilAction.do(cur.name, cur.data, this._actor); }, cur.delay);
            } else {
                UtilAction.do(cur.name, cur.data, this._actor);
            }
            this._act.idx += 1;
            if (this._act.idx >= this._act.data.length) {
                this._act = undefined;
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
        if(this._actor.isPlayer) {
            Msg.emit('msg_stat_times', name); 
        }
    }

    public update (deltaTime: number) {
        if (GScene.isLoadScene) return;
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
        const cur = this._act?.data[this._act.idx]!;
        if (cur === undefined || this._act === undefined) {
            throw new Error(`Error actor action index: ${this._act?.idx}`);
        }
        if (this._act.time >= cur.time) {
            if (cur.delay > 0) {
                fun.delay(() => { UtilActionEquip.do(cur.name, cur.data, this._actor); }, cur.delay);
            } else {
                UtilActionEquip.do(cur.name, cur.data, this._actor);
            }
            this._act.idx += 1;
            if (this._act.idx >= this._act.data.length) {
                this._act = undefined;
            }
            this._actor.actionEnd();
            return true;
        }
        return false;
    }

}

export class ActionQueue extends Action {

    public update (deltaTime: number) {
        if (GScene.isLoadScene) return;
        if (this._act) {
            this._act.time += deltaTime;
            let cur = this._act.data[this._act.idx];
            if (this._act.time >= cur.time) {
                UtilAction.do(cur.name, cur.data);
                this._act.idx += 1;
                if (this._act.idx >= this._act.data.length) {
                    this._act = undefined;
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
    public data: ActionInfo[];
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

    public static do (name: string, key: action_type, actor: ActorBase | undefined = undefined) {
        var action = this[name];
        if (action) {
            action(key, actor);
        } else {
            console.warn('Not defined action:' + name);
        }
    }

    public static on_check_preload() {
        if (GScene.isPreload)
            GScene.isLoadScene = true;
    }

    public static on_scene (key: string) {
        
        GScene.Load(key, () => { });
    }

    public static off_scene (key: string) {
        
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
        Sound.playLoop(key, volume);
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
        var obj = Res.inst(asset, Level.Instance._objectNode);
        obj.setPosition(0, 0, 0);
    }

    public static on_inst (key: string, actor: Actor) {

        var asset = ResCache.Instance.getPrefab(key);
        var obj = Res.inst(asset, Level.Instance._objectNode);
        if (actor !== undefined && actor._view) {
            obj.parent = actor._view;
            obj.setPosition(0, 0, 0);
        }

    }

    public static off_inst (key: string, actor: ActorBase) {

    }

    public static on_inst_fx(data:any, actor: ActorBase) {
        var res = data.res;
        var bone = data.bone;
        var asset = ResCache.Instance.getPrefab(res);
        var obj = Res.inst(asset, Level.Instance._objectNode);
        if (actor !== undefined && actor._view) {
            var bone_node = actor.node.getChildByName(bone);
            obj.parent = bone_node;
            obj.setPosition(0, 0, 0);
        }
    }


    public static off_inst_fx(data:any, actor: ActorBase) {
        var res = data.res;
        var bone = data.bone;
        if (actor !== undefined && actor._view !== null) {
            var off_fx = actor.node.getChildByName(bone)?.getChildByName(res);
            if (off_fx) off_fx.emit('setDestroy'); 
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
            console.log('Not register SkeletalAnimation');
    }

    public static on_anig (data: any, actor: ActorBase) {
        if (actor._animationGraph && actor._animationGraph.play) {
            actor._animationGraph.play(data.key, data.value);
        } else
            console.log('Not register animationGraph.');
    }

    public static on_set (data: key_type, actor: ActorBase) {
        //console.log(`on set key:${data.key}  value:${data.value}`);
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

    public static on_com (key:string, actor: ActorBase) {
        actor.node.addComponent(key);
    }

    public static on_call (key: string, actor: ActorBase) {
        actor[key]();
    }
}

export class UtilActionEquip {

    public static do (name: string, key: action_type, actor: ActorEquipBase | undefined = undefined) {
        var action = this[name];
        if (action) {
            action(key, actor);
        } else {
            console.warn('Not defined action:' + name);
        }
    }

    public static on_check_preload() {
        if (GScene.isPreload) GScene.isLoadScene = true;
    }

    public static on_scene (key: string) {
        GScene.Load(key, () => { });
    }

    public static off_scene (key: string) {
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
        Sound.on(sfx);
    }

    public static off_sfx (key: string) {
        Sound.off(key);
    }

    public static on_sfxing(key: string, volume = 1) {
        Sound.playLoop(key, volume);
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
        var obj = Res.inst(asset, Level.Instance._objectNode);
        obj.setPosition(0, 0, 0);
    }

    public static on_inst (key: string, actor: Actor) {
        var asset = ResCache.Instance.getPrefab(key);
        var obj = Res.inst(asset, Level.Instance._objectNode);
        if (actor && actor._viewRoot) {
            obj.parent = actor._viewRoot!;
            obj.setPosition(0, 0, 0);
        }
    }

    public static off_inst (key: string, actor: ActorEquipBase) {

    }

    public static on_inst_fx(data:any, actor: ActorEquipBase) {
        var res = data.res;
        var bone = data.bone;
        var asset = ResCache.Instance.getPrefab(res);
        var obj = Res.inst(asset, Level.Instance._objectNode);
        if (actor !== undefined && actor._view !== null) {
            var bone_node = actor.node.getChildByName(bone);
            obj.parent = bone_node;
            obj.setPosition(0, 0, 0);
        }
    }


    public static off_inst_fx(data:any, actor: ActorEquipBase) {
        var res = data.res;
        var bone = data.bone;
        if (actor !== undefined && actor._view !== null) {
            var off_fx = actor.node.getChildByName(bone)?.getChildByName(res);
            if (off_fx) off_fx.emit('setDestroy'); 
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
        if (actor._animationGraph) actor._animationGraph.play(data.key, data.value);
        else console.log('Not register animationGraph.');
    }

    public static on_set (data: key_type, actor: ActorEquipBase) {
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