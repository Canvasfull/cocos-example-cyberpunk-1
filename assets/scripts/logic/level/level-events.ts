import { _decorator, Component, Node } from 'cc';
import { Level } from './level';
const { ccclass, property } = _decorator;

@ccclass('level_events')
export class level_events extends Component {

    _events = null
    _time = 0;
    _index = 0;

    _max = 0;
    _cur:any;

    start() {

    }

    public init(events:any) {
        this._events = events;
        this._index = 0;
        this._max = this._events.length;

        this._cur = this._events[this._index];
    }

    updateEvent(deltaTime: number) {

        if(this._index >= this._max) return;

        this._time += deltaTime;

        if(this._time > this._cur.time) {
            Level.Instance.addEnemy(this._cur.res);
            this._index++;
            if(this._index < this._max)
                this._cur = this._events[this._index];
        }

    }
}

