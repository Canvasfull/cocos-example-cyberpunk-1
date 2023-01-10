import { _decorator, Node, find, Vec3, v3, director } from 'cc';
import { Action } from '../../core/action/action';
import { Save } from '../data/save';
import { Msg } from '../../core/msg/msg';
import { Singleton } from '../../core/pattern/singleton';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { Actor } from '../actor/actor';
import { DropItem } from '../item/drop-item';
import { NavPoints } from '../navigation/navigation-system';
import { DataNavigationInst } from '../data/data-core';
import { ActorBase } from '../../core/actor/actor-base';
import { ActorInputBrain } from '../actor/actor-input-brain';
import { ActorBrain } from '../actor/actor-brain';
const { ccclass, property } = _decorator;

export class Level extends Singleton {

    _player: Node | undefined;
    _enemyList:Node | undefined;
    _action: Action | undefined;
    _data:{[key:string]:any} = {};
    _time: number = 0;
    _actor:Actor | undefined;
    _isStart = false;
    _spawns:{ position:Vec3, size:number }[] = [];
    _cur_spawn_idx = 0;
    _update = null;
    _node:Node | null | undefined;
    _spawn_pos = v3(0, 0, 0);
    _enemies:Node[] = [];
    _score:number = 0;

    _objectNode:Node | null | undefined;

    public init (): void {

        this._action = new Action('action-level');
        this._data = Object.assign(ResCache.Instance.getJson('data-level').json);

        this._objectNode = find('init')?.getChildByName('objects');

        console.log('xxxxxxxxxxx:', this._objectNode);

        Msg.on('level_action', this.levelAction.bind(this));
        Msg.on('level_do', this.do.bind(this));

        const scoreLevel = this._data.score_level;
        for(let i = 0; i < scoreLevel.length; i++) {
            const infos = scoreLevel[i];
            console.log(infos);
            for(let k in infos) {
                if(k == 'score') continue;
                console.log(k, infos[k]);
            }
        }
        
    }

    public do(fun:string) {
        this[fun]();
    }

    public onLevelStart() {
        Save.Instance.nextStatistics();
        console.log(Save.Instance._cur);
    }

    public initSpawn() {
        this._node = this._objectNode?.getChildByName(this._data.level_events);
        if(this._node === null) throw new Error(`Not find level ${this._data.level_events} node.`);
        NavPoints.Init(DataNavigationInst._data);
    }

    public levelAction (name: string) {
        console.log('-----------------on level event:', name)
        this._isStart = true;
        this._time = 0;
        this._action!.on(name);
    }

    public addPlayer () {
        const point = NavPoints.randomPoint();
        const prefab = ResCache.Instance.getPrefab('player');
        this._player = Res.inst(prefab, this._objectNode!, point.position);
        this._actor = this._player.getComponent(Actor)!;
        this._actor.isPlayer = true;
        this._actor.init('data-player');
        if (this._actor === null ) {
            throw new Error(`Level add player can not bind Actor Component.`);
        }
    }

    public addEnemy(res:string, groupID:number) {
        const point = NavPoints.randomPoint();
        var prefab = ResCache.Instance.getPrefab('enemy');
        var enemy = Res.inst(prefab, this._objectNode!, point.position);
        const actor = enemy.getComponent(ActorBase);
        enemy.addComponent(ActorInputBrain);
        enemy.addComponent(ActorBrain);
        actor!._groupIndex = groupID;
        actor!.init(`data-${res}`);
        this._enemies.push(enemy);
        return enemy;
    }

    public removeEnemy(node:Node) {
        for(let i = 0; i < this._enemies.length; i++) {
            if(this._enemies[i] === node) {
                this._enemies.splice(i, 1);
                break;
            }
        }
    }

    public addDrop(res:string, pos:Vec3 | undefined) {
        if (pos === undefined) {
            const point = NavPoints.randomPoint();
            pos = point.position;
        } 
        const prefab = ResCache.Instance.getPrefab('drop_item');
        const dropNode = Res.inst(prefab, this._objectNode!, pos);
        const drop = dropNode.getComponent(DropItem);

        if (drop === null) {
            throw new Error(`Drop node can not add component Drop Item.`);
        }

        drop.init(res);

    }

    public addObj(res:string) {
        const point = NavPoints.randomPoint();
        var prefab = ResCache.Instance.getPrefab(res);
        var objNode = Res.inst(prefab, this._objectNode!, point.position);
        return objNode;
    }

    public update (deltaTime: number): void {
        if (!this._isStart) return;
        this._time += deltaTime;
        this._action!.update(deltaTime);
        Msg.emit('msg_update_map');
    }

    public gameOver () {
        this._isStart = false;
        Msg.emit('msg_stat_time', {key:'play', time:this._time});
        this.calculateScore();
        this._enemies = [];
        Save.Instance.saveGameOver(this._time, this._score);
    }

    public calculateScore() {
        const scoreLevels = this._data.score_level;
        let passLevel = true;
        this._score = scoreLevels.length - 1;
        for(let i = 0; i < scoreLevels.length; i++) {
            const infos = scoreLevels[i];
            console.log(infos);
            passLevel = true;
            for(let k in infos) {
                if(k == 'score') continue;
                console.log(Save.Instance._currentStatistics[k], k, infos[k]);
                if(Save.Instance._currentStatistics[k] < infos[k]) {
                    passLevel = false;
                    break;
                }
            }
            if(passLevel) {
                this._score = i;
                break;
            }
        }
    }

    public getLevelScore() {
        return this._data.score_level[this._score].score;
    }

}
