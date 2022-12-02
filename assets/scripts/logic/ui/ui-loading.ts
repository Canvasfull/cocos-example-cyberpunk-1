import { _decorator, Component, Node, Label } from 'cc';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('ui_loading')
export class ui_loading extends Component {

    @property([String])
    strpoints:string[] = [];

    @property
    delay = 1;
    _time = 1;
    _idx = 0;

    _txt_loading:Label = Object.create(null);

    start() {
        this._time = this.delay;
        this._txt_loading = this.getComponent(Label);
    }

    update(deltaTime: number) {

        this._time -= deltaTime;

        if(this._time < 0) {
            this._time += 1;
            this._idx++;
            if(this._idx > this.strpoints.length) this._idx = 0;
            this._txt_loading.string = this.strpoints[this._idx];
        }
        
    }
}

