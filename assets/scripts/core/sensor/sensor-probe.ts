
import { _decorator, Component, Node, ITriggerEvent, ICollisionEvent, Collider } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = sensor
 * DateTime = Mon Feb 21 2022 17:07:50 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = sensor-.ts
 * FileBasenameNoExtension = sensor-
 * URL = db://assets/scripts/core/sensor/sensor-.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('SensorProbe')
export class SensorProbe extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    _collider:Collider = Object.create(null);

    start() {
        this._collider = this.getComponent(Collider);
        //this._collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this._collider.on('onCollisionEnter', this.onCollisionEnter, this);
    }

    //onTriggerEnter(event: ITriggerEvent) {
        //event.otherCollider.emit('onTrigger', this.node);
    //}

    onCollisionEnter(event: ICollisionEvent) {
        console.log('on collision enter:', event.otherCollider.name);
        this.node.emit('onHit', event.otherCollider.name);
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}
