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

import { _decorator, Node, find, Vec3, v3 } from 'cc';
import { Action } from '../../core/action/action';
import { Save } from '../data/save';
import { Msg } from '../../core/msg/msg';
import { Singleton } from '../../core/pattern/singleton';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { Actor } from '../actor/actor';
import { DropItem } from '../item/drop-item';
import { NavSystem } from '../navigation/navigation-system';
import { DataEquipInst, DataNavigationInst } from '../data/data-core';
import { UtilVec3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

export class Level extends Singleton {

    // Action objects are used to execute the current set of actions.
    _action: Action | undefined;

    // Level data object to store static game data.
    _data:{[key:string]:any} = {};

    // Level time.
    _time: number = 0;

    // The state at the beginning of the level.
    _isStart = false;

    // The spawn position of the player's level.
    _spawn_pos = v3(0, 2, 0);

    // The score of the level.
    _score:number = 0;

    // The player's game object.
    _player:Actor | undefined;

    // List of nodes of level enemies.
    _enemies:Node[] = [];

    // The root node of all objects at game runtime.
    _objectNode:Node | null | undefined;

    /**
     * Initialize the level object.
     */
    public init (): void {

        // Get the level data and copy it for storage.
        this._data = Object.assign(ResCache.Instance.getJson('data-level').json);

        // Create an action object to manage the action of the level.
        this._action = new Action('action-level');
        
        // Find the root node of all objects.
        this._objectNode = find('init')?.getChildByName('objects');

        // Register external message access function mapping.
        Msg.on('level_action', this.levelAction.bind(this));
        Msg.on('level_do', this.do.bind(this));

        // Test the score of the level data.
        const scoreLevel = this._data.score_level;
        for(let i = 0; i < scoreLevel.length; i++) {
            const infos = scoreLevel[i];
            for(let k in infos) {
                if(k == 'score') continue;
            }
        }
        
    }

    /**
     * Executes the function with the name specified by the current object.
     * @param fun Name of the function to be executed.
     */
    public do(fun:string) {
        this[fun]();
    }

    /**
     * This function is used to set the behavior related to the start of the level.
     */
    public onLevelStart() {
        // Switch to the next statistic.
        Save.Instance.nextStatistics();

        // Print the current statistics.
        console.log(Save.Instance._cur);

        // Initialize the current pathfinding data.
        NavSystem.Init(DataNavigationInst._data);
    }

    public levelAction (name: string) {
        this._isStart = true;
        this._action!.on(name);
    }

    /**
     * Added level role method.
     * Used to initialize the character game object.
     */
    public addPlayer () {

        // Get a random node from the navigation system.
        //const point = NavSystem.randomPoint();

        // Get the player's prefab object from the resource cache.
        const prefab = ResCache.Instance.getPrefab(this._data.prefab_player);

        // Instantiate player level game object.
        const resPlayer = Res.inst(prefab, this._objectNode!, this._data.spawn_pos);

        // Get the Actor from the player level game object.
        this._player = resPlayer.getComponent(Actor)!;

        // Detect if this actor exists
        if (this._player === null ) {
            throw new Error(`Level add player can not bind Actor Component.`);
        }

        // Set the player tag value of this actor to true.
        this._player.isPlayer = true;

        // Initialize the player object.
        this._player.init('data-player');

    }

    public addEnemy(res:string, groupID:number) {

         // Get a random node from the navigation system.
        const point = NavSystem.randomPoint();

        var prefab = ResCache.Instance.getPrefab(this._data.prefab_enemy);
        var enemy = Res.inst(prefab, this._objectNode!, point.position);
        enemy.name = res;
        const actor = enemy.getComponent(Actor);
        actor!._groupIndex = groupID;
        actor!.init(`data-${res}`);
        actor!.isReady = true;
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
            const point = NavSystem.randomPoint();
            pos = point.position;
        } 
        const prefab = ResCache.Instance.getPrefab(this._data.prefab_drop_item);
        const dropNode = Res.inst(prefab, this._objectNode!, pos);
        const drop = dropNode.getComponent(DropItem);

        const data = DataEquipInst.get(res);

        if (drop === null) {
            throw new Error(`Drop node can not add component Drop Item.`);
        }

        drop.init(res, data.drop_effect_index);

    }

    public addObj(res:string) {
        const point = NavSystem.randomPoint();
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
