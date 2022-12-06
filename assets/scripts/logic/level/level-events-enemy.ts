import { _decorator, Component, Node, randomRange, random } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Msg } from '../../core/msg/msg';
import { Level } from './level';
const { ccclass, property } = _decorator;

@ccclass('LevelEventsEnemy')
export class LevelEventsEnemy extends Component {

    _interval:number = 0.1;

    probability:any;
    counter = 0;
    groupCounter:Array<number> | undefined;

    killCounter = 0;

    start() {
        this.probability = Level.Instance._data.probability_drop_enemy;
        this.groupCounter = new Array(Level.Instance._data.enemies.length);
        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);
        Msg.bind('msg_remove_enemy', this.remove, this);
    }

    onDestroy() {
        Msg.off('msg_remove_enemy', this.remove);
    }

    nextEvent() {

        this._interval = randomRange(this.probability.interval[0], this.probability.interval[1]);

        if(this.counter >= this.probability.max) return;

        const odds = random();
        const weights = this.probability.weights;
        let occurGroupIndex = -1;

        for(let iWeight = 0; iWeight < weights.length; iWeight++) {
            if(odds <= weights[iWeight]) {
                occurGroupIndex = iWeight;
                break;
            }
        }

        if(occurGroupIndex == -1) {
            throw new Error(`Error calculate weight on Level events enemy. value:${odds}`);
        }

        const currentMax = this.groupCounter![occurGroupIndex];

        const weightMax = this.probability.weights_max;

        if(currentMax >= weightMax[occurGroupIndex]) {
            this._interval = this.probability.interval_weight_max;
            return;
        }
        const currentIndex = this.probability.weights_group[occurGroupIndex];
        const res = Level.Instance._data.enemies[currentIndex];
        const enmey = Level.Instance.addObj(res);
        const actor = enmey.getComponent(ActorBase);
        actor._groupIndex = occurGroupIndex;
        this.counter++;
        this.groupCounter![occurGroupIndex]++;

    }

    public remove(groupIndex:number) {
        this.killCounter++;
        Msg.emit('kill_enemy', this.killCounter);
        this.groupCounter![groupIndex]--;
        if(this.groupCounter![groupIndex] < 0) {
            throw new Error(`Multiply remove enemy. group index = ${groupIndex}`);
        }
    }

    update(deltaTime: number) {
        if(!Level.Instance._isStart) return;
        this._interval -= deltaTime;
        if(this._interval <= 0) {
            this.nextEvent();
        }
        
    }
}

