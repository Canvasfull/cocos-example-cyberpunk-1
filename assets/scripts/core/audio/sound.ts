import { Node, AudioSource, game, director } from "cc";
import { Save } from "../data/save";
import { Msg } from "../msg/msg";
import { Res } from "../res/res";
import { ResCache } from "../res/res-cache";
/**
 * Predefined variables
 * Name = audio
 * DateTime = Wed Jan 12 2022 17:23:47 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = audio.ts
 * FileBasenameNoExtension = audio
 * URL = db://assets/scripts/core/audio/audio.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

export class Sound {

    private static _sfxAudio: AudioSource = null;
    private static _bgmAudio: AudioSource = null;

    public static volume: number = 0.5;
    public static volume_load = 1;
    public static source_pool_count = 30;
    public static pool:AudioSource[] = [];

    private static _template_source:Node;
    private static _pool_root:Node;

    public static init (): void {
        var prefab = ResCache.Instance.getPrefab('sound');
        var soundNode = Res.inst(prefab);
        director.addPersistRootNode(soundNode);
        this._sfxAudio = soundNode.getChildByName('sfx').getComponent(AudioSource);
        this._bgmAudio = soundNode.getChildByName('bgm').getComponent(AudioSource);

        // Init pool.
        this._pool_root = soundNode.getChildByName('pool_root');
        this._template_source = soundNode.getChildByName('template');
        for(var i = 0; i < this.source_pool_count; i++) this.addPool();

        // Init sound volume.
        var v = Save.Instance.get('sfx_volume');
        if (v == null) v = 1;
        this.volume = v;
        this.Refresh();
        Msg.on('sli_sound', this.setVolume.bind(this));

        Msg.onbind('sound_load', this.onLoad, this);
        Msg.onbind('sound_load_end', this.onLoadEnd, this);
    }

    private static addPool() {
        var newnode = Res.instNode(this._template_source,  this._pool_root);
        this.pool.push(newnode.getComponent(AudioSource)); 
    }

    public static setVolume (volume: number) {
        this.volume = volume;
        this.Refresh();
        Save.Instance.set('sfx_volume', volume);
    }

    private static Refresh () {
        this._sfxAudio.volume = this.volume;
        this._bgmAudio.volume = this.volume;
    }

    //static soundlist = [];
    //static sound_count = 0;

    public static oning (key: string, volume_muti: number = 1): number {

        //find unuse.
        let index = -1;
        for(var i = 0; i < this.pool.length; i++) {
            if(this.pool[i].clip == null) {
                index = i;
                break;
            }
        }

        // add new one.
        if(index == -1) {
            this.addPool();
            index = this.pool.length - 1;
        }

        Res.loadAudio(`sound/${key}`, (err, asset) => {
            this.pool[index].clip = asset;
            this.pool[index].volume = this.volume * volume_muti;
            this.pool[index].loop = true;
            this.pool[index].play();
        });

        return index;

    }

    public static offing (index: number): void {
        this.pool[index].stop();
        this.pool[index].loop = false;
        this.pool[index].clip = null;
    }

    public static on (key: string, volume_muti: number = 1): void {
        Res.loadAudio(`sound/${key}`, (err, asset) => {
            this._sfxAudio.playOneShot(asset, this.volume * volume_muti);
        });
    }

    public static addSfx (node: Node, key: string, volume: number = 1) {

        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if (!node.isValid) return;
            let source = node.getComponent(AudioSource);
            source.clip = asset;
            source.loop = true;
            source.volume = volume * this.volume_load;
        });
    }

    public static getClip(key:string, call:Function) {

         Res.loadAudio(`sound/${key}`, (err, asset) => {
            call(asset);
        });
    }

    public static off (key: string) {
        //console.log('audio off', key);
    }

    public static onBGM (key: string): void {
        Res.loadAudio(`sound/${key}`, (err, asset) => {
            this._bgmAudio.stop();
            this._bgmAudio.clip = asset;
            this._bgmAudio.loop = true;
            this._bgmAudio.volume = this.volume;
            this._bgmAudio.play();
        });
    }

    public static offBGM (key: string): void {
        this._bgmAudio.stop();
        this._bgmAudio.clip = null;
        this._bgmAudio.loop = false;
        //console.log('off bgm', key);
    }

    public static pauseBGM (): void {
        this._bgmAudio.pause();
    }

    public static onLoad() {
        this.volume_load = 0;
    }

    public static onLoadEnd() {
        this.volume_load = 1;
    }

}
