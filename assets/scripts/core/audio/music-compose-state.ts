import { _decorator, Component, Node, AudioClip, AudioSource, math } from 'cc';
import { Msg } from '../msg/msg';
import { Sound } from './sound';
const { ccclass, property } = _decorator;

@ccclass('music_compose_state')
export class music_compose_state extends Component {

    @property([AudioClip])
    clips:AudioClip[] = [];

    @property
    smooth:number = 0.1;

    @property(Number)
    selects:number[] = [];

    _curs:number[] = [];

    _audios:AudioSource[] = [];


    start() {

        for(var i = 0; i < this.clips.length; i++) {
            var as = this.node.addComponent(AudioSource);
            as.clip = this.clips[i];
            as.volume = 0;
            as.loop = true;
            as.play();
            this._audios.push(as);
            this._curs.push(0);
        }

    }

    update(deltaTime: number) {
        for(var i = 0; i < this._audios.length; i++) {
            this._curs[i] = math.lerp(this._curs[i], this.selects[i], deltaTime * this.smooth);
            this._audios[i].volume = this._curs[i] * Sound.volume;
        }
    }
}

