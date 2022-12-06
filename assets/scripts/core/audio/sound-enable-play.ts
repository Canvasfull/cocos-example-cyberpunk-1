import { _decorator, Component, Node, find, AudioSource, Vec3 } from 'cc';
import { Msg } from '../msg/msg';
import { Sound } from './sound';
const { ccclass, property } = _decorator;

@ccclass('SoundEnablePlay')
export class SoundEnablePlay extends Component {

    @property(String)
    sfx_name: string | undefined;

    @property
    enable_distance: boolean = false;

    @property
    max_distance = 6;

    @property
    max_sound = 1.0;

    @property
    min_sound = 0.5;

    @property
    relate_height: boolean = false;

    @property
    max_height = 10;

    _audioSource: AudioSource = Object.create(null);

    _distance_percent = 1;

    _volume = 1;

    __preload () {
        this._audioSource = this.node.addComponent(AudioSource);
        Sound.addSfx(this.node, this.sfx_name!);
        if (this.relate_height) {
            var height = this.node.worldPosition.y;
            if (height > this.max_height) height = this.max_height;
            this._volume = height / this.max_height;
            if (this._volume > this.max_sound) this._volume = this.max_sound;
            if (this._volume < this.min_sound) this._volume = this.min_sound;
        }
    }

    onEnable() {
        this._audioSource.play();
    }

    onDisable() {
        this._audioSource.stop();
    }

    update (deltaTime: number) {

        /*
        if (actor_main.target && actor_main.target.worldPosition) {
            var dis = Vec3.distance(this.node.worldPosition, actor_main.target.worldPosition);
            if (dis >= this.max_distance) dis = this.max_distance;
            this._audioSource.volume = Sound.volume * (1 - dis / this.max_distance) * this._volume * Sound.volume_load;
        }
        */

    }

}

