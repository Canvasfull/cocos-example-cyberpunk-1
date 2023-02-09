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
const { ccclass, property } = _decorator;

@ccclass('LevelEventsItems')
export class LevelEventsItems extends Component {

    _interval:number = 0.1;

    probability:any;
    counter = 0;
    groupCounter:Array<number> | undefined;

    start() {
        this.probability = DataLevelInst._data.probability_drop_enemy;
        this.groupCounter = new Array(DataLevelInst._data.enemies.length);
        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);
        Msg.on('msg_remove_item', this.remove);
    }

    onDestroy() {
        Msg.off('msg_remove_item', this.remove);
    }

    nextEvent() {

        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);

        if (this.counter >= this.probability.max) return;

        const odds = random();
        const weights = this.probability.weights;
        let occurGroupIndex = -1;

        for(let iWeight = 0; iWeight < weights.length; iWeight++) {
            if (odds <= weights[iWeight]) {
                occurGroupIndex = iWeight;
                break;
            }
        }

        if (occurGroupIndex === -1) {
            throw new Error(`Error calculate weight on Level Infinite Events. value:${odds}`);
        }

        const currentMax = this.groupCounter![occurGroupIndex];

        const weightMax = this.probability.weights_max;

        if (currentMax >= weightMax[occurGroupIndex]) {
            this._interval = this.probability.interval_weight_max;
            return;
        }

        const currentIndex = this.probability.weights_group[occurGroupIndex];
        const res = DataLevelInst._data.items[currentIndex];
        Level.Instance.addDrop(res);
        this.counter++;
        this.groupCounter![occurGroupIndex]++;     
        console.log('create one item.');

    }

    public remove(groupIndex:number) {
        this.groupCounter![groupIndex]--;
        if (this.groupCounter![groupIndex] < 0) {
            throw new Error(`Mutiply remove enemy. group index = ${groupIndex}`);
        }
    }

    update(deltaTime: number) {
        if (!Level.Instance._isStart && Level.Instance.stop && !Level.Instance._player) return;
        this._interval -= deltaTime;
        if (this._interval <= 0) {
            this.nextEvent();
        }
        
    }
}

