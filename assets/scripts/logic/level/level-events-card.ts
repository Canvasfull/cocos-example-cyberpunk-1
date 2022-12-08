import { _decorator, Component, Node, randomRange, random } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Level } from './level';
const { ccclass, property } = _decorator;

@ccclass('LevelEventsCard')
export class LevelEventsCard extends Component {

    _interval:number = 0.1;

    probability:any;
    counter = 0;
    groupCounter:Array<number> | undefined;

    nextCounter = 2;

    counterCard = 0;

    start() {
        this.probability = Level.Instance._data.probability_drop_card;
        this.groupCounter = new Array(Level.Instance._data.cards.length);
        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);
        this.nextCounter = 2;
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
        const res = Level.Instance._data.items[excludeIndex];
        
        Msg.emit('push', 'upgrade_cards');

        this.counter++;
        this.groupCounter![excludeGroupIndex]++;    

    }

    checkNextEvent(counter:number) {
        if (counter > this.nextCounter) {
            this.nextEvent();
        }
    }

    /*
    update(deltaTime: number) {

        if (!Level.Instance._isStart) return;
        this._interval -= deltaTime;
        if (this._interval <= 0) {
            this.nextEvent();
        }
        
    }
    */
}
