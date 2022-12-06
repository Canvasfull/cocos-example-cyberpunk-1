
import { _decorator, JsonAsset, Prefab, TextAsset, SpriteFrame } from 'cc';
import { Singleton } from '../pattern/singleton';
import { Res } from './res';
const { ccclass, property } = _decorator;

@ccclass('ResCache')
export class ResCache extends Singleton {

    private _json: { [name: string]: JsonAsset } = {};
    private _prefab: { [name: string]: Prefab } = {};
    private _txt: { [name: string]: TextAsset } = {};
    private _sprite: { [name: string]: SpriteFrame } = {};
    private _callback: Function = null;

    public load (callback: Function): void {
        this._callback = callback;
        Res.loadJson('data/data-res-cache', (err, asset) => {
            if(err) {
                console.error('Load cache res error:', err);
                return;
            }

            ResCache.Instance.loadJson(asset.json['json']);
            ResCache.Instance.loadPrefab(asset.json['prefab']);
            ResCache.Instance.loadSprite(asset.json['sprite']);
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

    public setJson (asset) {
        asset.forEach(element => {
            this._json[element.name] = element;
        });
    }

    public setPrefab (asset) {
        asset.forEach(element => {
            this._prefab[element.data.name] = element;
        });
    }

    public setText (asset) {
        asset.forEach(element => {
            this._txt[element.name] = element;
        });
    }

    public setSprite (asset) {
            asset.forEach(element => {
            this._sprite[element.name] = element;
        });
    }

    public loadJson (paths: string[]) {
        paths.forEach(element => {
            Res.loadDirJson(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setJson(asset);
                }
            });
        });
    }

    public loadPrefab (paths: string[]) {
        paths.forEach(element => {
            Res.loadDirPrefab(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setPrefab(asset);
                }
            });
        });
    }

    public loadText (paths: string[]) {
        paths.forEach(element => {
            Res.loadDirText(element, (err, asset) => {
                if (asset) {
                    ResCache.Instance.setText(asset);
                }
            })
        });
    }

    public loadSprite(paths: string[]) {
        paths.forEach(element => {
            Res.loadDirSprite(element, (err, asset) => {
                if(asset) {
                    ResCache.Instance.setSprite(asset);
                }
            })
        });
    }

    public checkEnd (): void {
        if (this._callback) {
            if (Res.count <= 0) {
                this._callback();
                this._callback = null;
            }
        }
    }

}
