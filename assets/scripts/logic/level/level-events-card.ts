import { _decorator, Component, Node, randomRange, random, randomRangeInt } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Level } from './level';
import { DataUpgradeCardInst } from '../data/data-core';
import { Local } from '../../core/localization/local';
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
        this.probability = Level.Instance._data.probability_drop_card;
        this.groupCounter = new Array(Level.Instance._data.cards.length);
        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);
        this.nextCounter = 100000;
        Msg.bind('kill_enemy', this.checkNextEvent, this);

    }

    nextEvent() {

        this.counterCard++;
        this.nextCounter += this.counterCard * 2;

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

        const excludeIndex = this.probability.weights_group[excludeGroupIndex];
        
        const cards = Level.Instance._data.cards;
        for(let i = 0; i < cards.length; i++) {
            if(excludeIndex === excludeIndex) continue;
            this.currentCards[i] = {
                name:cards[i],
                info:this.calculateCardInfo(cards[i])
            };
        }
        
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
        return isFloat? randomRange(range[0], range[1]) : randomRangeInt(range[0], range[1]);
    }

    checkNextEvent(counter:number) {
        if (counter > this.nextCounter) {
            this.nextEvent();
        }
    }
}
