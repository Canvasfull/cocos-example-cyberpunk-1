import { Singleton } from "../../core/pattern/singleton";
import { ResCache } from "../../core/res/res-cache";


export class Buff extends Singleton {

    _data = {};

    public init(): void {

        this._data = ResCache.Instance.getJson('data-buff').json;

    }

    public get(key) {
        if (this._data[key]) {
            return this._data[key];
        }else{
            console.error('can not find buff:', key);
        }
    }

}