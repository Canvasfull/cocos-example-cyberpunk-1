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

import { Singleton } from "../../core/pattern/singleton"
import { GMath } from '../../core/util/g-math';
import { IO } from "../../core/io/io";
import { UtilArray } from "../../core/util/util";
import { JsonTool } from "../../core/io/json-tool";
import { Msg } from "../../core/msg/msg";
import { ResCache } from "../../core/res/res-cache";
import { Game } from "./game";

interface key_any {
    [key: string]: any
}

export class Save extends Singleton {

    _uuid = '';
    _cur: key_any = {};
    _uuidKey = 'uuid';
    _archiveKey = 'archive_list';
    _archiveList: string[] | undefined;

    _saveJson:any;
    _backup_counter = 0;

    _currentStatistics:key_any = {};

    get PlayerID() {
        if (this._cur.player_id === undefined) this._cur.player_id = 27;
        return this._cur.player_id;
    }

    public init (): void {

        this._saveJson = ResCache.Instance.getJson('data-save').json;
        if (!IO.exist(this._archiveKey + '.json')) { 
            this._archiveList = [];
            this.newArchive();
        } else {
            this._archiveList = JsonTool.toIOObject(this._archiveKey);
            this._uuid = this._archiveList![0];
            this.loadArchive(this._uuid);
            this._uuid = IO.read(this._uuidKey + '.json');
        }
        Msg.on('msg_stat_times', this.statisticsTimes.bind(this));
        Msg.on('msg_stat_time', this.statisticsTime.bind(this));
        Msg.on('msg_stat_distance', this.statisticsDistance.bind(this));
        Msg.on('msg_save_archive', this.saveArchive.bind(this));

    }

    public backup() {

        this._backup_counter--;
        if (this._backup_counter > 0) return;
        this._backup_counter = 5;

    }

    public saveArchiveList () {
        IO.write(this._archiveKey + '.json', JsonTool.toJson(this._archiveList));
    }

    public saveArchive () {
        try {
            //Achievement.Instance.updateData();
            var data = JsonTool.toJson(this._cur);
            IO.write(this._uuid + '.json', data);
            this.backup();
        }catch(error){
            console.error('save archive error.');
        }

    }

    public hasArchive (): boolean {
        return this._archiveList!.length > 0;
    }

    public newArchive () {
        this._cur = this._saveJson;
        this._uuid = GMath.uuid();
        this._archiveList!.push(this._uuid);
        IO.write(this._uuidKey + '.json', this._uuid);
        this.saveArchive();
        this.saveArchiveList();
    }

    public loadArchive (name: string) {
        this._uuid = name;
        IO.write(this._uuidKey + '.json', this._uuid);
        let read_data = IO.read(name + '.json');
        //console.log(name, read_data);
        if (read_data === undefined) {
            console.error('can not read data uuid key:', this._uuid);
            this._cur = Object.assign(this._saveJson);
        }else{
            this._cur = JsonTool.toObject(read_data) as IArchive;
        }
        
        // Add new data input index.
        if (this._cur.input_index === undefined) this._cur.input_index = 0;
    }

    public loadBackup (name: string) {
        this._uuid = name;
        var data = IO.read(name + '_b0.json');
        this._cur = JsonTool.toObject(data) as IArchive; 
    }

    public deleteArchive (name: string) {
        UtilArray.remove(this._archiveList!, name);
        this.saveArchiveList();
        IO.delete(name + '.json');
    }

    public deleteAllArchive () {
        if (this._archiveList) {
            this._archiveList.forEach(element => {
                IO.delete(element + '.json');
            });
            this._archiveList = undefined;
        }
        IO.delete(this._archiveKey + '.json');
        IO.delete(this._uuid + '.json');
    }

    public get<T> (name: string): T {
        try {
            return this._cur[name];
        } catch {
            throw new Error(`Save not find key's value. The key is : ${name}`);
        }

    }

    public set<T> (name: string, value: T) {
        this._cur[name] = value;
        this.saveArchive();
    }

    setValue(name:string, value:any) {
        this._cur[name] = value;
    }

    public setStatistics(name:string, value:number) {
        this._currentStatistics[name] = value;
    }

    public getStatistics(name: string) {
        const value = this._currentStatistics[name];
        return value === undefined ? 0 : value;
    }

    public saveGameOver () {
        this.statisticsFinalScore();
    }

    public clearByKey(key:string) {
        this._cur[key] = {};
        this.saveArchive();
    }

    public statisticsTimes(key:string) {
        var statKey = key + 'Times'
        if (this._currentStatistics[statKey] === undefined) this._currentStatistics[statKey] = 0;
        this._currentStatistics[statKey] += 1;
    }

    public statisticsTime(data:{key:string, time:number}) {
        var statKey = data.key + 'Time';
        if (this._currentStatistics[statKey] === undefined) this._currentStatistics[statKey] = 0; 
        this._currentStatistics[statKey] += data.time;
    }

    public statisticsDistance(data:{key:string, distance:number}) {
        var statKey = data.key + 'Distance';
        if (this._currentStatistics[statKey] === undefined) this._currentStatistics[statKey] = 0; 
        this._currentStatistics[statKey] += data.distance;
    }

    public statisticsValue(key:string): number {
        return this._currentStatistics[key];
    }

    public statisticsFinalScore() {
        for(let k in this._currentStatistics) {
            this._cur.statistics[k] += this._currentStatistics[k];
        }
    }

    public nextStatistics() {
        if(this._cur.history_index === undefined) this._cur.history_index = -1;

        this._cur.history_index++;

        console.log('history index:', this._cur.history_index);

        if(this._cur.history_index > Game.Instance._data.max_history_statistics)
            this._cur.history_index = 0;

        if(this._cur.history === undefined) this._cur.history = [];

        if(this._cur.history_index >= this._cur.history.length) {
            this._cur.history.push({});
        }

        this._currentStatistics = this._cur.history[this._cur.history_index];

    }

}

export interface IArchive {

    totalTime: number;
    playTimes: 0;
    language: string;
    name: string;
    nickname: string;
    money: number;
    guideIndex: 0;
    mapAutoIndex: 10;
}