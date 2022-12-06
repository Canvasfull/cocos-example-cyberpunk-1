import { _decorator, Component, Collider, ITriggerEvent, ICollisionEvent, animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SensorAnig')
export class SensorAnig extends Component {

    _collider: Collider = null;

    @property(animation.AnimationController)
    graph: animation.AnimationController = null

    @property
    key:string = '';

    start () {
        // [3]
        this._collider = this.getComponent(Collider);
        this._collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this._collider.on('onCollisionEnter', this.onCollisionEnter, this);
    }

    onTriggerEnter (event: ITriggerEvent) {
        this.play(this.key, true);
    }

    onCollisionEnter (event: ICollisionEvent) {
        this.play(this.key, true);
    }

    play (key: string, value: boolean | number) {
        this.graph?.setValue(key, value);
    }
}

