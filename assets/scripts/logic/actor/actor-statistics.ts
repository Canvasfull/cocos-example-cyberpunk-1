import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { Actor } from './actor';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('ActorStatistics')
export class ActorStatistics extends Component {

    actor:Actor | undefined;

    _velocity = v3(0, 0, 0);

    _statisticsTime = 1;

    _moveDistance = 0;

    _runDistance = 0;

    start() {
        this.actor = this.getComponent(Actor)!;
    }

    update(deltaTime: number) {

        this.actor?._actorMove?.rigid?.getLinearVelocity(this._velocity);

        this._velocity.y = 0;

        const length = this._velocity.length();
        if(length > 0.1) {
            const distance = length * deltaTime;

            this._moveDistance += distance;
            
            if(this.actor?._data.isRun) {
                this._runDistance += distance;
            }

            this._statisticsTime -= deltaTime;
            if(this._statisticsTime <= 0) {
                this._statisticsTime = 1;
                Msg.emit('msg_stat_distance', {key:'move', distance:this._moveDistance});

                if(this._runDistance > 0)
                    Msg.emit('msg_stat_distance', {key:'run', distance:this._runDistance});

                this._moveDistance = 0;
                this._runDistance = 0;
            }
        }
        
    }
}

