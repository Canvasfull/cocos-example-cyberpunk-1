import { _decorator, Component, Node } from 'cc';
import { IO } from './io';
const { ccclass, property } = _decorator;

export class JsonTool {
    public static toJson(data: any): string {
        return JSON.stringify(data);
    }

    public static toObject(data: any): any {
        return JSON.parse(data);
    }

    public static toIOObject(path: any): any{
        var str = IO.read(path+'.json');
        if (str) {
            return this.toObject(str);
        }
    }
}
