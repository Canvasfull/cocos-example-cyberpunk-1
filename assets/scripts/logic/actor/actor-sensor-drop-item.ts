import { _decorator, Component, Node } from 'cc';
import { Msg } from '../../core/msg/msg';
import { SensorRays } from '../../core/sensor/sensor-rays';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorSensorDropItem')
export class ActorSensorDropItem extends Component {

    @property(Actor)
    actor:Actor | undefined | null;

    sensor:SensorRays | undefined | null;
    pickedNode:Node | undefined

    state = -1;
    curState = -1;

    start() {
        this.sensor = this.getComponent(SensorRays);
        if (this.sensor === null) {
            throw new Error(`${this.node.name} node can not find 'SensorRays' component.`);
        }
    }

    update(deltaTime: number) {

        if (this.sensor!.checked) {
            this.pickedNode = this.sensor!.checkedNode;
            const dropName = this.pickedNode!.name
            this.curState = 255;
            console.log('check drop name:', dropName);
        }else{
            this.curState = 0;
            this.pickedNode = undefined;
        }

        if (this.state !== this.curState) {
            this.state = this.curState;
            Msg.emit('msg_grp_take_info', this.state);
        }
        
    }

    public getPicked() {

        if (this.pickedNode != undefined) {
            return this.pickedNode;
        }

    }
}

