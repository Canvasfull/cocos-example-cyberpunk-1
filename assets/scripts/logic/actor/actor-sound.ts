import { _decorator, Component, randomRangeInt } from 'cc';
import { Sound } from '../../core/audio/sound';
import { KeyAnyType } from '../data/game-type';
import { Msg } from '../../core/msg/msg';
import { Actor } from './actor';
import { DataSoundInst } from '../data/data-core';
import { Level } from '../level/level';
const { ccclass, property } = _decorator;

@ccclass('ActorSound')
export class ActorSound extends Component {

    @property
    stepLength = 1.2;

    _currentStepLength = 0;

    _data:KeyAnyType = {};

    actor: Actor | undefined;

    start() {
        this.actor = this.getComponent(Actor)!;
        this._data = this.actor._data;
        Msg.on('msg_walk_sfx', this.walkSfx.bind(this));
    }

    onDestroy () {
        Msg.off('msg_walk_sfx', this.walkSfx.bind(this));
    }

    update(deltaTime:number) {

        // If Level is stop return.
        if(Level.Instance.stop) return;

        if(this._data.is_ground)
            this._currentStepLength += Math.abs(deltaTime * this.actor!._actorMove!.velocityLocal?.length());

        if(this._currentStepLength >= this.stepLength) {
            this.walkSfx();
            this._currentStepLength -= this.stepLength;
        }

    }

    walkSfx () {

        const type = `walk_${this._data.walk_in_type}`;
        const soundList = DataSoundInst.get(type);
        const index = randomRangeInt(0, soundList.length);
        Sound.on(soundList[index]);

    }

}

