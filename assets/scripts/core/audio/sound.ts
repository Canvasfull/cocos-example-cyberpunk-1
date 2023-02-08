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

import { Node, AudioSource } from "cc";
import { Save } from "../../logic/data/save";
import { Msg } from "../msg/msg";
import { Res } from "../res/res";
import { Game } from "../../logic/data/game";
import { ResCache } from "../res/res-cache";

export class Sound {

    private static _sfxAudio: AudioSource;
    private static _bgmAudio: AudioSource;

    public static volumeSound: number = 0.5;

    public static volumeMusic: number = 1;

    public static sceneMusicPercent: number = 1;

    public static _volumeLoad = 1;
    public static _sourcePoolCount = 30;
    public static _pool:AudioSource[] = [];

    private static _templateSource:Node;
    private static _poolRoot:Node;

    public static init (): void {

        // Initialize sound prefab.
        const prefab = ResCache.Instance.getPrefab('sound');

        const soundNode = Res.inst(prefab, Game.Instance._poolNode);
        this._sfxAudio = soundNode.getChildByName('sfx')?.getComponent(AudioSource)!;
        this._bgmAudio = soundNode.getChildByName('bgm')?.getComponent(AudioSource)!;

        // Init pool.
        this._poolRoot = soundNode.getChildByName('pool_root')!;
        this._templateSource = soundNode.getChildByName('template')!;
        for(let i = 0; i < this._sourcePoolCount; i++) this.addPool();

        // Init sound volume.
        let volume = Save.Instance.get('sfx_volume');
        if (volume === undefined) volume = 1;
        this.volumeSound = volume;

        // Init sound music.
        let volumeMusic = Save.Instance.get('sfx_volume_music');
        if(volumeMusic === undefined) volumeMusic = 1;
        this.volumeMusic = volumeMusic;

        this.Refresh();

        Msg.on('sli_sound', this.setVolume.bind(this));
        Msg.on('sli_music', this.setVolumeMusic.bind(this));

        Msg.bind('sound_load', this.onLoad, this);
        Msg.bind('sound_load_end', this.onLoadEnd, this);
    }

    private static addPool() {
        var newNode = Res.instNode(this._templateSource,  this._poolRoot);
        this._pool.push(newNode.getComponent(AudioSource)!); 
    }

    public static setVolume (volume: number) {
        this.volumeSound = volume;
        this._sfxAudio.volume = this.volumeSound;
        Save.Instance.set('sfx_volume', volume);
    }

    public static setVolumeMusic (volume: number) {
        this.volumeSound = volume;
        this._bgmAudio.volume = this.volumeMusic;
        Save.Instance.set('sfx_volume_music', volume); 
    }

    private static Refresh () {
        this._sfxAudio.volume = this.volumeSound;
        this._bgmAudio.volume = this.volumeMusic;
    }

    public static playLoop (key: string, volumeMultiply: number = 1): number {

        //find unused.
        let index = -1;
        for(let i = 0; i < this._pool.length; i++) {
            if (this._pool[i].clip === null) {
                index = i;
                break;
            }
        }

        // add new one.
        if (index === -1) {
            this.addPool();
            index = this._pool.length - 1;
        }

        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if (err) {
                throw new Error(`Can not find sound resource : sound/${key}`);
            }
            if (asset) {
                this._pool[index].clip = asset;
                this._pool[index].volume = this.volumeSound * volumeMultiply;
                this._pool[index].loop = true;
                this._pool[index].play();
            }
        });

        return index;

    }

    public static offing (index: number): void {
        this._pool[index].stop();
        this._pool[index].loop = false;
        this._pool[index].clip = null;
    }

    public static on (key: string, volumeMultiply: number = 1): void {
        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if (asset) {
                this._sfxAudio.playOneShot(asset, this.volumeSound * volumeMultiply * this.sceneMusicPercent);
            }
        });
    }

    public static addSfx (node: Node, key: string, volume: number = 1) {
        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if (err) {
                throw new Error(`Can not find sound resource : sound/${key}`);
            }
            if (asset) {
                if (!node.isValid) return;
                let source = node.getComponent(AudioSource)!;
                source.clip = asset;
                source.loop = true;
                source.volume = volume * this._volumeLoad;
            }
        });
    }

    public static off (key: string) {
        
    }

    public static onBGM (key: string): void {
        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if (err) {
                throw new Error(`Can not find sound resource : sound/${key}`);
            }
            if (asset) {
                this._bgmAudio.stop();
                this._bgmAudio.clip = asset;
                this._bgmAudio.loop = true;
                this._bgmAudio.volume = this.volumeMusic;
                this._bgmAudio.play();
            }
        });
    }

    public static offBGM (key: string): void {
        this._bgmAudio.stop();
        this._bgmAudio.clip = null;
        this._bgmAudio.loop = false;
        
    }

    public static updateBGM() {
        this._bgmAudio.volume = this.volumeMusic * this.sceneMusicPercent;
    }

    public static pauseBGM (): void {
        this._bgmAudio.pause();
    }

    public static onLoad() {
        this._volumeLoad = 0;
    }

    public static onLoadEnd() {
        this._volumeLoad = 1;
    }

}
