import { _decorator, Component, Node, find, utils, Vec3, debug, math, v3, randomRangeInt, randomRange, RigidBody } from 'cc';
import { Action, ActionParallel } from '../../core/action/action';
import { Save } from '../../core/data/save';
import { Msg } from '../../core/msg/msg';
import { Singleton } from '../../core/pattern/singleton';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { u3, UtilNode } from '../../core/util/util';
import { Actor } from '../actor/actor';
import { DropItem } from '../item/drop-item';
const { ccclass, property } = _decorator;

export class Level extends Singleton {

    _player: Node | undefined;
    _enemyList:Node | undefined;
    _action: Action | undefined;
    _data:{[key:string]:any} = {};
    _time: number = 0;
    _score: number = 0;
    _actor:Actor | undefined;
    _isStart = false;
    _spawns:{ position:Vec3, size:number }[] = [];
    _cur_spawn_idx = 0;
    _update = null;
    _node:Node | null | undefined;
    _spawn_pos = v3(0, 0, 0);

    public init (): void {

        this._action = new Action('action-level');
        this._data = Object.assign(ResCache.Instance.getJson('data-level').json);   

        Msg.on('level_action', this.levelAction.bind(this));
        Msg.on('level_do', this.do.bind(this));
        
    }

    public do(fun:string) {
        this[fun]();
    }

    public initSpawn() {
        this._node = find(this._data.level_events);
        if(this._node === null) throw new Error(`Not find level ${this._data.level_events} node.`);
        const spawns = UtilNode.getChildByName(this._node, 'spawns');
        for(let i = 0; i < spawns.children.length; i++ ) {
            const child = spawns.children[i];
            this._spawns.push({
                'position': child.getPosition(),
                'size': child.getWorldScale().x/2
            })
        }  
        console.log(this._spawns);
    }

    public randomSpawns() {
        this._cur_spawn_idx = randomRangeInt(0, this._spawns.length);
        var spawn = this._spawns[this._cur_spawn_idx]; 
        u3.c(this._spawn_pos, spawn.position);
        this._spawn_pos.x += randomRange(-spawn.size, spawn.size);
        this._spawn_pos.z += randomRange(-spawn.size, spawn.size);
        this._spawn_pos.y += 1;
    }

    public levelAction (name: string) {
        console.log('-----------------on level event:', name)
        this._isStart = true;
        this._time = 0;
        this._action!.on(name);
    }

    public addPlayer () {
        this.randomSpawns();
        const prefab = ResCache.Instance.getPrefab('player');
        this._player = Res.inst(prefab, undefined, this._spawn_pos);
        this._actor = this._player.getComponent(Actor)!;
        if (this._actor === null ) {
            throw new Error(`Level add player can not bind Actor Component.`);
        }
    }

    public addEnemy(name:string) {
        
    }

    public addDrop(res:string, pos:Vec3 | undefined) {
        if (pos === undefined) {
            this.randomSpawns();
            pos = this._spawn_pos;
        } 
        const prefab = ResCache.Instance.getPrefab('drop_item');
        const dropNode = Res.inst(prefab, undefined, pos);
        const drop = dropNode.getComponent(DropItem);

        if (drop === null) {
            throw new Error(`Drop node can not add component Drop Item.`);
        }

        drop.init(res);

    }

    public addObj(res:string) {
        this.randomSpawns();
        var prefab = ResCache.Instance.getPrefab(res);
        var objNode = Res.inst(prefab, undefined, this._spawn_pos);
        return objNode;
    }

    public update (deltaTime: number): void {
        if (!this._isStart) return;
        this._action!.update(deltaTime);
    }

    public saveWin () {
    }

    public saveLose() {
        Save.Instance.saveLose(this._time);
    }

}
