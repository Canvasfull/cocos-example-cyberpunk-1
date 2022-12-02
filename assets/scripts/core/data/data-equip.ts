import { ResCache } from "../res/res-cache";

export class DataEquip {

    _data = {};

    constructor() {
    }

    public init() {

        this._data = ResCache.Instance.getJson('data-equips').json;

    }

    public getItem(name:string) {

        const item = this._data[name];

        if(item == undefined) {
            throw new Error(` Can not find ${name} equips data.`);
        }

        return item;
    }

}