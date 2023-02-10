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

import { _decorator, Component, Node, randomRange, random } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Level } from './level';
import { DataLevelInst } from '../data/data-core';
const { ccclass } = _decorator;

@ccclass('LevelEventsEnemy')
export class LevelEventsEnemy extends Component {

    // Used to record the interval at which time occurs.
    _interval:number = 0.1;

    // The probability data of enemy drops.
    probability:any;

    // Used for the total number of enemies already generated.
    counter = 0;

    // Used to count the total number of each grouping.
    groupCounter:Array<number> | undefined;

    // Total number of deaths.
    killCounter = 0;

    start() {

        // Get probability.
        this.probability = DataLevelInst._data.probability_drop_enemy;

        // Initialize group statistics based on the number of groups.
        this.groupCounter = new Array(DataLevelInst._data.enemies.length);

        // Get the time of the next decision cycle.
        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);

        // Register enemy event logic.
        Msg.on('msg_remove_enemy', this.remove.bind(this));
    }

    onDestroy() {

        // Register enemy event logic.
        Msg.off('msg_remove_enemy', this.remove.bind(this));
    }

    /**
     * Calculates a monster generation event.
     * @returns 
     */
    generateEvent() {

        // If the total number of enemies in the scene is greater than or equal to the maximum value No enemy generation logic is performed.
        // The total number of survivors is equal to the total number of generation minus the number of deaths.
        if ((this.counter - this.killCounter) >= this.probability.max) return;

        // Get a random value range [0-1].
        const odds = random();

        // Get a list of weights.
        const weights = this.probability.weights;

        // Set default occur group index.
        let occurGroupIndex = -1;

        // Find the matching index in a random list based on a random number.
        for(let iWeight = 0; iWeight < weights.length; iWeight++) {
            if (odds <= weights[iWeight]) {
                occurGroupIndex = iWeight;
                break;
            }
        }

        // Determine if it is found, if not it means there is a problem with the data configuration.
        // The set of random intervals contains all interval values from 0 - 1.
        if (occurGroupIndex === -1) {
            throw new Error(`Error calculate weight on Level events enemy. value:${odds}`);
        }

        // Get the maximum value of the current group.
        const currentMax = this.groupCounter![occurGroupIndex];

        // 
        const weightMax = this.probability.weights_max;

        if (currentMax >= weightMax[occurGroupIndex]) {
            this._interval = this.probability.interval_weight_max;
            return;
        }

        const currentIndex = this.probability.weights_group[occurGroupIndex];
        const res = DataLevelInst._data.enemies[currentIndex];

        // Send add add enemy.
        Msg.emit('msg_add_enemy', {res:res, groupID:occurGroupIndex})

        // Increase event count.
        this.counter++;

        // Increase the mapping event group count.
        this.groupCounter![occurGroupIndex]++;

        // Send warning message.
        if(res == 'boss_0') Msg.emit('level_action', 'warning');

    }

    /**
     * Removes enemies and updates the corresponding stats.
     * @param groupIndex Group ID to be removed.
     */
    public remove(groupIndex:number) {
       
        // Increase the number of kills once
        this.killCounter++;

        // The number of current index groups minus one.
        this.groupCounter![groupIndex]--;

        // Exception judgment, if it is less than 0 it means there is a duplicate count of enemy death statistics.
        // You need to check the death-related logic to see if multiple deaths were executed.
        if (this.groupCounter![groupIndex] < 0) {
            throw new Error(`Multiply remove enemy. group index = ${groupIndex}`);
        }

        // Triggers a death execution message.
        Msg.emit('msg_kill_enemy', this.killCounter);
    }

    /**
     * The detection logic is executed per frame.
     * @param deltaTime The incremental time of the current frame. 
     * @returns 
     */
    update(deltaTime: number) {

        // 
        if (!Level.Instance._isStart && Level.Instance.stop && !Level.Instance._player) return;
        this._interval -= deltaTime;

        // Interval time less than 0 to start event detection.
        if (this._interval <= 0) {
            
            // Get the time of the next decision cycle.
            this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);

            // Execute generated events.
            this.generateEvent();
        }
        
    }
}

