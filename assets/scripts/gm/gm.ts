import { DEV } from 'cc/env';
import Electron from "../core/app/Electron";
import { Save } from "../logic/data/save";
import { ResCache } from "../core/res/res-cache";

export class GM {

    private static _dic: { [key: string]: Function } = {};

    private static _data = Object.create(null);

    public static init () {

        this._data = ResCache.Instance.getJson('data-gm').json;
        console.log(this._data);
        this._dic['clear_data'] = (data: string) => {
            Save.Instance.clear_data(data[1]);
        }
        this._dic['delete_all'] = (data: string) => {
            Save.Instance.deleteAllArchive();
        }
        this._dic['clear_by_key'] = (data: string) => {
            Save.Instance.clearByKey(data[1]);
        }
        this._dic['set'] = (data: string) => {
            Save.Instance.set(data[1], data[2]);
        }
        this._dic['app'] = (data: string) => {
            const info = data[1].split(':');
            Electron.sendAsync(info[0], info[1]);
        }

    }

    static deleteAll () {
        Save.Instance.deleteAllArchive();
    }

    public static run (data: string) {
        const cmdList = data.split(' ');
        const cmd = cmdList[0];
        let cmdFun = this._dic[cmd];
        if (cmdFun) {
            cmdFun(cmdList);
        }
    }

    public static getHelp () {
        let info = 'GM help:';
        this._data['gm_help'].forEach(element => {
            info += element + '\n\n';
        });
        console.log(info);
        return info;
    }

}

globalThis.GM = GM;
