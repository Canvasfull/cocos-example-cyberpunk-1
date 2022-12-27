
import { _decorator, Component, Node, ITriggerEvent, ICollisionEvent, Collider } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SensorProbe')
export class SensorProbe extends Component {
    _collider:Collider | undefined | null;

    start() {
        this._collider = this.getComponent(Collider);
        this._collider!.on('onCollisionEnter', this.onCollisionEnter, this);
    }
    
    onCollisionEnter(event: ICollisionEvent) {
        console.log('on collision enter:', event.otherCollider.name);
        this.node.emit('onHit', event.otherCollider.name);
    }

}
