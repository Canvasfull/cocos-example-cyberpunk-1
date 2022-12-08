import { Save } from "../data/save";
import { Log } from "../io/log";
import { Msg } from "../msg/msg";
import { Singleton } from "../pattern/singleton";
import { Res } from "../res/res";
import { ResCache } from "../res/res-cache";

export class Local extends Singleton {

    index: number = 1;
    max: number = 2;
    _data = Object.create(null);
    _map = Object.create(null);

    public init (): void {

        this._data = ResCache.Instance.getJson('local').json;
        this.max = this._data.language.length;
        this.index = Save.Instance._cur.languageIndex;

        if (this.index === -1) {
            var sys_language = window.navigator.language.toLocaleLowerCase();
            sys_language = sys_language.replace('-', '_');
            console.log(sys_language);
            for(var i = 0; i < this._data.language.length; i++) {
                var name = this._data.language[i];
                if (sys_language.includes(name)) {
                    this.index = i;
                    break;
                }
            }
            if (this.index === -1) this.index = 2;
        }

        Msg.on('next_language', () => {
            this.index++;
            if (this.index >= this.max) this.index = 0;
            Save.Instance._cur.languageIndex = this.index;
            Local.Instance.refresh();
        });

        Msg.on('pre_language', () => {
            this.index--;
            if (this.index < 0) this.index = this.max - 1;
            Save.Instance._cur.languageIndex = this.index;
            Local.Instance.refresh();
        });

        this.refresh();

    }

    public get (name: string): string {
        const val = this._map[name];
        if (val) {
            return val;
        } else {
            return name;
        }
    }

    public getShowName () {
        return this._data.show_name[this.index];
    }

    public refresh (): void {
        var name = this._data.language[this.index];
        this._map = ResCache.Instance.getJson(name).json;
        //refresh
        Msg.emit('refresh_local');

    }

}
