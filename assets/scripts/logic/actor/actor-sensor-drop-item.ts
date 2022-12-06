import { _decorator, Component, Node } from 'cc';
import { Msg } from '../../core/msg/msg';
import { SensorRays } from '../../core/sensor/sensor-rays';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorSensorDropItem')
export class ActorSensorDropItem extends Component {

    sensor:SensorRays;

    @property(Actor)
    actor:Actor = null;

    state = -1;
    curState = -1;

    pickedNode:Node = null;

    start() {
        this.sensor = this.getComponent(SensorRays);
    }

    update(deltaTime: number) {

        if(this.sensor.checked) {
            this.pickedNode = this.sensor.checkedNode;
            const dropName = this.pickedNode.name
            this.curState = 255;
            console.log('check drop name:', dropName);
        }else{
            this.curState = 0;
            this.pickedNode = null;
        }

        if(this.state != this.curState) {
            this.state = this.curState;
            Msg.emit('msg_grp_take_info', this.state);
        }
        
    }

    public getPicked() {

        if(this.pickedNode != null) {
            return this.pickedNode;
        }

    }
}

