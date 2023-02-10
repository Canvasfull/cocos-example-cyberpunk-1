/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

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

        if(!player) return;

        if(player && player?._data?.is_low_hp && !player.is_dead) {
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

