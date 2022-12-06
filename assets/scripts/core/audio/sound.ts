import { Node, AudioSource, game, director } from "cc";
import { Save } from "../data/save";
import { Msg } from "../msg/msg";
import { Res } from "../res/res";
import { ResCache } from "../res/res-cache";

export class Sound {

    private static _sfxAudio: AudioSource;
    private static _bgmAudio: AudioSource;

    public static volume: number = 0.5;
    public static _volumeLoad = 1;
    public static _sourcePoolCount = 30;
    public static _pool:AudioSource[] = [];

    private static _templateSource:Node;
    private static _poolRoot:Node;

    public static init (): void {
        var prefab = ResCache.Instance.getPrefab('sound');
        var soundNode = Res.inst(prefab);
        director.addPersistRootNode(soundNode);
        this._sfxAudio = soundNode.getChildByName('sfx')?.getComponent(AudioSource)!;
        this._bgmAudio = soundNode.getChildByName('bgm')?.getComponent(AudioSource)!;

        // Init pool.
        this._poolRoot = soundNode.getChildByName('pool_root')!;
        this._templateSource = soundNode.getChildByName('template')!;
        for(var i = 0; i < this._sourcePoolCount; i++) this.addPool();

        // Init sound volume.
        var v = Save.Instance.get('sfx_volume');
        if (v == null) v = 1;
        this.volume = v;
        this.Refresh();

        Msg.on('sli_sound', this.setVolume.bind(this));
        Msg.bind('sound_load', this.onLoad, this);
        Msg.bind('sound_load_end', this.onLoadEnd, this);
    }

    private static addPool() {
        var newNode = Res.instNode(this._templateSource,  this._poolRoot);
        this._pool.push(newNode.getComponent(AudioSource)!); 
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

    public static playLoop (key: string, volumeMultiply: number = 1): number {

        //find unused.
        let index = -1;
        for(var i = 0; i < this._pool.length; i++) {
            if(this._pool[i].clip == null) {
                index = i;
                break;
            }
        }

        // add new one.
        if(index == -1) {
            this.addPool();
            index = this._pool.length - 1;
        }

        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if(err) {
                throw new Error(`Can not find sound resource : sound/${key}`);
            }
            if(asset) {
                this._pool[index].clip = asset;
                this._pool[index].volume = this.volume * volumeMultiply;
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
            if(asset) {
                this._sfxAudio.playOneShot(asset, this.volume * volumeMultiply);
            }
        });
    }

    public static addSfx (node: Node, key: string, volume: number = 1) {
        Res.loadAudio(`sound/${key}`, (err, asset) => {
            if(err) {
                throw new Error(`Can not find sound resource : sound/${key}`);
            }
            if(asset) {
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
            if(err) {
                throw new Error(`Can not find sound resource : sound/${key}`);
            }
            if(asset) {
                this._bgmAudio.stop();
                this._bgmAudio.clip = asset;
                this._bgmAudio.loop = true;
                this._bgmAudio.volume = this.volume;
                this._bgmAudio.play();
            }
        });
    }

    public static offBGM (key: string): void {
        this._bgmAudio.stop();
        this._bgmAudio.clip = null;
        this._bgmAudio.loop = false;
        
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
