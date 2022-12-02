import { _decorator, Component, Node, AudioClip, AudioSource, random, randomRangeInt, math } from 'cc';
import { Sound } from './sound';
const { ccclass, property } = _decorator;

@ccclass('music_compose_random')
export class music_compose_random extends Component {

    @property([AudioClip])
    clips:AudioClip[] = [];

    @property([Number])
    probability:number[] = [];

    @property
    time:number = 0;

    @property
    least_count = 1;

    @property
    smooth:number = 0.1;

    _selects:number[] = [];

    _curs:number[] = [];

    _t:number = 0;

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
            this._selects.push(1);
        }

        this.randomPlay();

    }

    update(deltaTime: number) {

        if(this._t > this.time) {
            this._t -= this.time;
            this.randomPlay();
        }

        this._t += deltaTime;

        for(var i = 0; i < this._audios.length; i++) {
            this._curs[i] = math.lerp(this._curs[i], this._selects[i], deltaTime * this.smooth);
            this._audios[i].volume = this._curs[i] * Sound.volume;
        }
    }

    randomPlay() {

        var count = 0;
        for(var i = 0; i < this.clips.length; i++) {
            if(Math.random() < this.probability[i]) {
                this._selects[i] = 1;
                count++;
            }else{
                this._selects[i] = 0;
            }
        }

        if(count == 0) {
            var select_one = randomRangeInt(0, this.clips.length);
            this._selects[select_one] = 1;
        }

        //console.log('play select:', this._selects);

    }
}

