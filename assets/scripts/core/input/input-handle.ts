
import { _decorator, Component, Node, EventKeyboard, input, Input } from 'cc';
import { Msg } from '../msg/msg';
import { Res } from '../res/res';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = input-handle
 * DateTime = Fri Jan 14 2022 19:16:30 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = RoleController.ts
 * FileBasenameNoExtension = RoleController
 * URL = db://assets/scripts/core/input/RoleController.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
export class InputHandle {

    static _map = Object.create(null);

    public static Init () {
        Res.loadJson('data/input', (err, asset)=>{
            if(asset) {
                this._map = asset.json;
                console.log(this._map);
            }
        });
    }

    public static create(type: string) {
        
    }

    public static do(key:string, id:number, data?: null | any) {
        const sendKey = id + this._map[key];
        if(sendKey) {
            Msg.emit(sendKey, data);
        }else{
            console.log('Not defined key' + key)
        }
    }

}
