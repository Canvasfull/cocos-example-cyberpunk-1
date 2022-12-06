import { _decorator, Component, Node, Label } from 'cc';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('UILoading')
export class UILoading extends Component {

    @property([String])
    pointList:string[] = [];

    @property
    delay = 1;

    _time = 1;
    _idx = 0;

    _txtLoading:Label | undefined | null;

    start() {
        this._time = this.delay;
        this._txtLoading = this.getComponent(Label);
        if(this._txtLoading === undefined || this._txtLoading === null) {
            throw new Error(`${this.node.name} node not find component Label.`);
        }
    }

    update(deltaTime: number) {

        this._time -= deltaTime;

        if(this._time < 0) {
            this._time += 1;
            this._idx++;
            if(this._idx > this.pointList.length) this._idx = 0;
            this._txtLoading!.string = this.pointList[this._idx];
        }
        
    }
}

