/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { Save } from "../../logic/data/save";
import { Msg } from "../msg/msg";
import { Singleton } from "../pattern/singleton";
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
            for(let i = 0; i < this._data.language.length; i++) {
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
            Msg.emit('msg_save_set', {key:'languageIndex', value:this.index});
            Local.Instance.refresh();
        });

        Msg.on('pre_language', () => {
            this.index--;
            if (this.index < 0) this.index = this.max - 1;
            Msg.emit('msg_save_set', {key:'languageIndex', value:this.index});
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
