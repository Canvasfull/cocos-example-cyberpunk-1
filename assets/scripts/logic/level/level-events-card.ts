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

import { _decorator, Component, Node, randomRange, random, randomRangeInt } from 'cc';
import { Msg } from '../../core/msg/msg';
import { DataLevelInst, DataUpgradeCardInst } from '../data/data-core';
import { Local } from '../../core/localization/local';
import { Level } from './level';
const { ccclass, property } = _decorator;

@ccclass('LevelEventsCard')
export class LevelEventsCard extends Component {

    _interval:number = 0.1;

    probability:any;
    counter = 0;
    groupCounter:Array<number> | undefined;

    currentCards: Array<{ name: string; info: any; }> = new Array(3);
    nextCounter = 2;
    counterCard = 0;

    start() {
        this.probability = DataLevelInst._data.probability_drop_card;
        this.groupCounter = new Array(DataLevelInst._data.cards.length);
        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);

        this.nextCounter = DataUpgradeCardInst._data.next_show_card_param_a;

        Msg.on('msg_kill_enemy', this.checkNextEvent.bind(this));
    }

    onDestroy() {
        Msg.off('msg_kill_enemy', this.checkNextEvent.bind(this));
    }

    nextEvent() {

        this.counterCard++;
        
        this.nextCounter += DataUpgradeCardInst._data.next_show_card_param_a * DataUpgradeCardInst._data.next_show_card_param_b;

        const odds = random();
        const weights = this.probability.weights;
        let excludeGroupIndex = -1;

        for(let iWeight = 0; iWeight < weights.length; iWeight++) {
            if (odds <= weights[iWeight]) {
                excludeGroupIndex = iWeight;
                break;
            }
        }

        if (excludeGroupIndex === -1) {
            throw new Error(`Error calculate weight level events card. value:${odds}`);
        }

        const currentMax = this.groupCounter![excludeGroupIndex];
        const weightMax = this.probability.weights_max;

        if (currentMax >= weightMax[excludeGroupIndex]) {
            this._interval = this.probability.interval_weight_max;
            return;
        }

        // Exclude 3, This is temp.
        const excludeIndex = 3;//this.probability.weights_group[excludeGroupIndex];
        
        // Get upgrade card list.
        const cards = DataLevelInst._data.cards;
        for(let i = 0; i < cards.length; i++) {
            if(i === excludeIndex) continue;
            this.currentCards[i] = {
                name:cards[i],
                info:this.calculateCardInfo(cards[i])
            };
        }

        Level.Instance.currentCards = this.currentCards;

        console.log('Current cards:', this.currentCards);

        Msg.emit('push', 'upgrade_cards');

        this.counter++;
        this.groupCounter![excludeGroupIndex]++;    

    }

    calculateCardInfo(name:string) {

        const upgradeCards = DataUpgradeCardInst._data;
        const selectCardData = upgradeCards[name];
        const randomCardIndex = randomRangeInt(0, selectCardData.length);
        const randomCardData = selectCardData[randomCardIndex];
        const valueCount = randomCardData.values.length;

        let values = new Array(valueCount);

        let describe = Local.Instance.get(randomCardData.describe);

        for(let i = 0; i < valueCount; i++) {
            const tempData = randomCardData.values[i];
            const tempValue = this.calculateRange(tempData.isFloat, tempData.range);
            const showValue = tempData.isFloat ? `${tempValue * 100} %` : `${tempValue}`;
            describe = describe.replace(`##${i}##`, showValue);
            values[i] = {
                "name":tempData.name,
                "isFloat":tempData.isFloat,
                "value": tempValue
            }
        }
        
        return { describe, values }

    }

    calculateRange(isFloat:boolean, range:number[]):number {
        if(range.length !== 2) return 0;
        let value = isFloat? randomRange(range[0], range[1]) : randomRangeInt(range[0], range[1]);
        if(isFloat) value = Number(value.toFixed(2));
        return value;
    }

    checkNextEvent(counter:number) {
        if (counter > this.nextCounter) {
            this.nextEvent();
        }
    }
}
