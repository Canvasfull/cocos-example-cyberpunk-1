
import { _decorator, Component, Node } from 'cc';
import { IO } from './io';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = json_tool
 * DateTime = Tue Jan 11 2022 23:41:08 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = json-tool.ts
 * FileBasenameNoExtension = json-tool
 * URL = db://assets/scripts/core/util/json-tool.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
export class JsonTool {
    public static toJson(data: any): string {
        return JSON.stringify(data);
    }

    public static toObject(data: any): any {
        return JSON.parse(data);
    }

    public static toIOObject(path: any): any{
        var str = IO.read(path+'.json');
        if(str) {
            return this.toObject(str);
        }
    }
}
