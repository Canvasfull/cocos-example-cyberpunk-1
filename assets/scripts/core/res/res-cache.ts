
import { _decorator, JsonAsset, Prefab, TextAsset, SpriteFrame, AudioClip } from 'cc';
import { Singleton } from '../pattern/singleton';
import { Res } from './res';
import { ILoadMsg } from '../../logic/ui/ui-loading';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('ResCache')
export class ResCache extends Singleton {

    private _json: { [name: string]: JsonAsset } = {};
    private _prefab: { [name: string]: Prefab } = {};
    private _txt: { [name: string]: TextAsset } = {};
    private _sprite: { [name: string]: SpriteFrame } = {};
    private _sound: { [name: string]: AudioClip } = {};
    private _callback: Function | undefined;

    msg:ILoadMsg | undefined;

    public load (callback: Function): void {
        this._callback = callback;
        Res.loadJson('data/data-res-cache', (err, asset) => {
            if (err) {
                console.error('Load cache res error:', err);
                return;
            }
            this.msg = {
                id:1,
                action:'load cache',
                current:'resource',
                wait_count:0,
                count:0
            }
            ResCache.Instance.loadJson(asset.json['json']);
            ResCache.Instance.loadPrefab(asset.json['prefab']);
            ResCache.Instance.loadSprite(asset.json['sprite']);
            ResCache.Instance.loadSound(asset.json['sound']);
            Msg.emit('msg_loading',this.msg);
        });
    }

    public getJson (name: string) {
        const ret = this._json[name];
        if (ret) {
            return ret;
        } else {
            console.error('Res cache not find json res:', name);
            return null;
        }
    }

    public getPrefab (name: string) {
        const ret = this._prefab[name];
        if (ret) {
            return ret;
        } else {
            console.error('Res cache not find prefab res:', name);
        }
    }

    public getTxt (name: string) {
        const ret = this._txt[name];
        if (ret) {
            return ret;
        } else {
            console.error('Res cache not find text res:', name);
        }
    }

    public getSprite (name: string) {
        const ret = this._sprite[name];
        if (ret !== undefined) {
            return ret;
        } else {
            console.error('Res cache not find sprite res:', name);
        }
    }

    public getSound (name: string) {
        const ret = this._sound[name];
        if (ret !== undefined) {
            return ret;
        } else {
            console.error('Res cache not find sound res:', name);
        } 
    }

    public setJson (asset: any[]) {
        asset.forEach(element => {
            this._json[element.name] = element;
        });
    }

    public setPrefab (asset: any[]) {
        asset.forEach(element => {
            this._prefab[element.data.name] = element;
        });
    }

    public setText (asset: any[]) {
        asset.forEach(element => {
            this._txt[element.name] = element;
        });
    }

    public setSprite (asset: any[]) {
        asset.forEach(element => {
            this._sprite[element.name] = element;
        });
    }

    public setSound (asset: any[]) {
        asset.forEach(element => {
            this._sound[element.name] = element;
        });
    }

    public loadJson (paths: string[]) {
        this.msg!.wait_count++;
        this.msg!.count++;
        paths.forEach(element => {
            Res.loadDirJson(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setJson(asset);
                    this.msg!.wait_count--;
                }
            });
        });
    }

    public loadPrefab (paths: string[]) {
        this.msg!.wait_count++;
        this.msg!.count++;
        paths.forEach(element => {
            Res.loadDirPrefab(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setPrefab(asset);
                    this.msg!.wait_count--;
                }
            });
        });
    }

    public loadText (paths: string[]) {
        this.msg!.wait_count++;
        this.msg!.count++;
        paths.forEach(element => {
            Res.loadDirText(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setText(asset);
                    this.msg!.wait_count--;
                }
            })
        });
    }

    public loadSprite(paths: string[]) {
        this.msg!.wait_count++;
        this.msg!.count++;
        paths.forEach(element => {
            Res.loadDirSprite(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setSprite(asset);
                    this.msg!.wait_count--;
                }
            })
        });
    }

    public loadSound(paths: string[]) {
        this.msg!.wait_count++;
        this.msg!.count++;
        paths.forEach(element => {
            Res.loadDirSound(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setSprite(asset);
                    this.msg!.wait_count--;
                }
            })
        });
    }

    public checkEnd (): void {
        if (this._callback) {
            if (Res.count <= 0) {
                this._callback();
                this._callback = undefined;
            }
        }
    }

}
