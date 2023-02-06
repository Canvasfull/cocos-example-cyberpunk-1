import { _decorator, Component, Node, randomRange, random } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Level } from './level';
const { ccclass, property } = _decorator;

@ccclass('LevelEventsItems')
export class LevelEventsItems extends Component {

    _interval:number = 0.1;

    probability:any;
    counter = 0;
    groupCounter:Array<number> | undefined;

    start() {
        this.probability = Level.Instance._data.probability_drop_enemy;
        this.groupCounter = new Array(Level.Instance._data.enemies.length);
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
        const res = Level.Instance._data.items[currentIndex];
        Level.Instance.addDrop(res);
        this.counter++;
        this.groupCounter![occurGroupIndex]++;     

    }

    public remove(groupIndex:number) {
        this.groupCounter![groupIndex]--;
        if (this.groupCounter![groupIndex] < 0) {
            throw new Error(`Mutiply remove enemy. group index = ${groupIndex}`);
        }
    }

    update(deltaTime: number) {

        if (!Level.Instance._isStart && Level.Instance.stop) return;
        this._interval -= deltaTime;
        if (this._interval <= 0) {
            this.nextEvent();
        }
        
    }
}

