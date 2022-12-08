import { _decorator, Component, Node } from 'cc';
import { UtilAction } from '../../core/action/action';
import { ActorBase } from '../../core/actor/actor-base';
import { Sound } from '../../core/audio/sound';
import { Buff } from '../data/buff';

export class ActorBuff {

    actor:ActorBase;

    buff = {};

    constructor(_actor:ActorBase) {
        this.actor = _actor;
    }

    public clear() {

        for(var key in this.buff) {
            var b = this.buff[key];
            if (b.sound)
                this.offSfx(b.sound);
        }
        this.buff = {};

    }

    public add(key) {

        var new_buff = Buff.Instance.get(key);
        if (this.buff[key] !== null) {
            this.buff[key].time = new_buff.time;
        }else{
            this.buff[key] = {};
            this.buff[key].time = new_buff.time;
            if (new_buff.start.properties)
                this.setProperties(new_buff.start.properties);
            if (new_buff.start.fx)
                this.setFx(new_buff.start.fx);
            if (new_buff.start.sound)
                this.onSfx(this.buff[key], new_buff.start.sound);
        }
       
    }

    public remove(key) {
        var removeBuff = Buff.Instance.get(key);
        if (removeBuff.start.properties)
            this.setProperties(removeBuff.start.properties, -1);
        if (removeBuff.start.fx)
            this.setFx(removeBuff.start.fx, 'off');
        if (removeBuff.start.sound)
            this.offSfx(this.buff[key].sound);
        delete this.buff[key];
    }

    update(deltaTime: number) {
        for(let key in this.buff) {
            this.buff[key].time -= deltaTime;
            if (this.buff[key].time <= 0) {
                this.remove(key)
            }
        } 
    }

    public setProperties(properties, dir = 1) {
        for(var key in properties) {
            this.actor._data[key] += properties[key] * dir;
        }
    }

    public setFx(fx, state = 'on') {
        state += '_inst_fx';
        for(var i = 0; i < fx.length; i++) {
            UtilAction.do(state, fx[i], this.actor);
        }

    }

    public onSfx(buff, sound) {
        buff.sound = [];
        for(let i = 0; i < sound.length; i++) {
            let sfx = sound[i];
            if (sfx.loop) {
                var idx = Sound.playLoop(sfx.res, sfx.volume);
                buff.sound.push(idx);
            }else{
                Sound.on(sfx.res, sfx.volume)
            }
        }   
    }

    public offSfx(sound) {
        for(var i = 0; i < sound.length; i++) {
            Sound.offing(sound[i]);
        }
    }
}

