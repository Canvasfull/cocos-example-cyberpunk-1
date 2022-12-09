import { ResCache } from "../res/res-cache";
import { KeyAnyType } from "./game-type";

export class DataBase {

    _data:KeyAnyType = {};
    _name:string = '';

    constructor() {}

    public init(name:string) {
        this._name = name;
        this._data = ResCache.Instance.getJson(name).json;
    }

    public get(name:string) {
        const item = this._data[name];
        if (item === undefined) {
            throw new Error(`${this._name} database not find ${name}.`);
        }
        return item;
    }

}