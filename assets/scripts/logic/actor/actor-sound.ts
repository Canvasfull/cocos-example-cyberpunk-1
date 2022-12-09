import { _decorator, Component, Node, game, random, randomRange, randomRangeInt } from 'cc';
import { Sound } from '../../core/audio/sound';
import { DataSoundInst } from '../../core/data/game';
import { KeyAnyType } from '../../core/data/game-type';
import { Msg } from '../../core/msg/msg';
import { SubstanceType } from '../item/substance-core';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorSound')
export class ActorSound extends Component {

    @property
    stepLength = 1.2;

    _currentStepLength = 0;

    _data:KeyAnyType = {};

    actor: Actor | undefined;

    init (actor: Actor) {
        this.actor = actor;
        this._data = this.actor._data;
        Msg.on('msg_walk_sfx', this.walkSfx.bind(this));
    }

    onDestroy () {
        Msg.off('msg_walk_sfx', this.walkSfx.bind(this));
    }

    update(deltaTime:number) {

        if(this._data.is_ground)
            this._currentStepLength += Math.abs(deltaTime * this.actor!._velocityLocal.length());

        if(this._currentStepLength >= this.stepLength) {
            this.walkSfx();
            this._currentStepLength -= this.stepLength;
        }

    }

    walkSfx () {

        const type = `walk_${this._data.walk_in_type}`;
        const soundList = DataSoundInst.get(type);
        const index = randomRangeInt(0, soundList.length);
        console.log(type, index,  soundList[index]);
        Sound.on(soundList[index]);

    }

}

