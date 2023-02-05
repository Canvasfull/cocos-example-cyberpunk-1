import { _decorator, AudioSource, Component, math, Node } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Level } from '../level/level';
import { Sound } from '../../core/audio/sound';
const { ccclass, property } = _decorator;

@ccclass('SfxHeart')
export class SfxHeart extends Component {
    
    _sfxAudio: AudioSource | undefined

    volume = 0;
    currentVolume = 0;

    sceneVolume = 1;
    currentSceneVolume = 1;

    isLow = false;
    

    start() {
        this._sfxAudio = this.getComponent(AudioSource)!;
        this._sfxAudio.volume = 0;
        this._sfxAudio.loop = true;
        this._sfxAudio.play();
    }

    update(deltaTime: number) {

        const player = Level.Instance._player;
        if(player) {
            if(player._data.is_low_hp) {
                if(this.isLow == false) {
                    this.isLow = true;
                    Msg.emit('msg_ui_fx_open', 'effect_low_hp');
                }
                this.currentVolume = Sound.volumeSound;
                this.currentSceneVolume = 0.1;
            }else{
                if(this.isLow){
                    this.isLow = false;
                    Msg.emit('msg_ui_fx_close', 'effect_low_hp');
                }
                this.currentVolume = 0;
                this.currentSceneVolume = 1;
            }
           this.volume = math.lerp(this.volume, this.currentVolume, deltaTime);
           this.sceneVolume = math.lerp(this.sceneVolume, this.currentSceneVolume, deltaTime);
           this._sfxAudio!.volume = this.volume;
           Sound.sceneMusicPercent = this.sceneVolume;
           Sound.updateBGM();
        }
        
    }
}

