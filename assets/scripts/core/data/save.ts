import { Singleton } from "../pattern/singleton"
import { GMath } from '../util/gmath';
import { IO } from "../io/io";
import { UtilArray } from "../util/util";
import { JsonTool } from "../io/json-tool";
import { Msg } from "../msg/msg";
import { Achievement } from "./achievement";
import Electron from "../app/Electron";
import { Game } from "./game";
import { JsonAsset } from "cc";
import { Notify } from "../io/notify";
import { ResCache } from "../res/res-cache";

interface key_any {
    [key: string]: any
}

/**
 * Predefined variables
 * Name = save
 * DateTime = Mon Jan 17 2022 16:23:53 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = save.ts
 * FileBasenameNoExtension = save
 * URL = db://assets/scripts/core/data/save.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
export class Save extends Singleton {

    _uuid = '';
    _cur: key_any;
    _uuidKey = 'uuid';
    _archiveKey = 'archive_list';
    _archiveList: string[] = null;

    _savejson = null;
    _backup_counter = 0;

    get PlayerID() {
        if(this._cur.playerid == undefined) this._cur.playerid = 27;
        return this._cur.playerid;
    }

    public init (): void {

        this._savejson = ResCache.Instance.getJson('data-save').json;
        console.log(this._savejson);

        if (!IO.exsit(this._archiveKey + '.json')) {
            console.log('************ create new _archive key');
            this._archiveList = [];
            this.newArchive(this._savejson);
        } else {
            console.log('read archive.');
            this._archiveList = JsonTool.toIOObject(this._archiveKey);
            this._uuid = this._archiveList[0];
            this.loadArchive(this._uuid);
            console.log('read uuid key:', this._uuidKey);
            this._uuid = IO.read(this._uuidKey + '.json');
            console.log('load arcive:', this._uuid);
        }
        Msg.on('msg_stat_times', this.statisticsTimes.bind(this));
        Msg.on('msg_stat_time', this.statisticsTime.bind(this));
        Msg.on('msg_save_archive', this.saveArchive.bind(this));

    }

    public backup() {

        this._backup_counter--;
        if(this._backup_counter > 0) return;
        this._backup_counter = 5;

    }

    public saveArchiveList () {
        IO.write(this._archiveKey + '.json', JsonTool.toJson(this._archiveList));
    }

    public saveArchive () {
        try {
            Achievement.Instance.updateData();
            var data = JsonTool.toJson(this._cur);
            IO.write(this._uuid + '.json', data);
            this.backup();
        }catch(error){
            console.error('save archive error.');
        }

    }

    public hasArchive (): boolean {
        return this._archiveList.length > 0;
    }

    public newArchive (savejson) {
        this._cur = savejson.json;
        this._uuid = GMath.uuid();
        this._archiveList.push(this._uuid);
        IO.write(this._uuidKey + '.json', this._uuid);
        this.saveArchive();
        this.saveArchiveList();
    }

    public loadArchive (name: string) {
        this._uuid = name;
        IO.write(this._uuidKey + '.json', this._uuid);
        let read_data = IO.read(name + '.json');
        console.log(name, read_data);
        if(read_data == undefined) {
            console.error('can not read data uuidkey:', this._uuid);
            this._cur = Object.assign(this._savejson);
        }else{
            this._cur = JsonTool.toObject(read_data) as IArchive;
        }
        

        // Add new data input index.
        if(this._cur.input_index == undefined) this._cur.input_index = 0;
    }

    public loadBackup (name: string) {
        this._uuid = name;
        var data = IO.read(name + '_b0.json');
        this._cur = JsonTool.toObject(data) as IArchive; 
    }

    public deleteArchive (name: string) {
        UtilArray.remove(this._archiveList, name);
        this.saveArchiveList();
        IO.delete(name + '.json');
    }

    public deletaAllArchive () {
        if (this._archiveList) {
            this._archiveList.forEach(element => {
                IO.delete(element + '.json');
            });
            this._archiveList = null;
        }
        IO.delete(this._archiveKey + '.json');
        IO.delete(this._uuid + '.json');
    }

    public get<T> (name: string): T {
        try {
            return this._cur[name];
        } catch {
            return null;
        }

    }

    public set<T> (name: string, value: T) {
        this._cur[name] = value;
        this.saveArchive();
    }

    public getCurMap () {
        var index = this._cur.mapIndex;
        return this._cur.maps[index];
    }

    public getSelectIndex():number {
        if(this._cur.select_level == undefined)
            this._cur.select_level = 0;
        return this._cur.select_level; 
    }

    public getSelectedPos() {
        if(this._cur.select_level == undefined)
            this._cur.select_level = 0;
        return this._cur.maps[this._cur.select_level].pos;
    }

    public setMap (index: number, name: string) {
        this._cur.mapIndex = index;
        this._cur.mapName = name;
        this._cur.select_level = index;
        if(this._cur.select_index == undefined) {
            this._cur.select_index = [0,0,0];
        }
        this._cur.select_index[this._cur.mapModelIndex] = index;
        this.saveArchive();
    }

    public getModeMaps() {
        var modelname = Game.Instance._data.modes[this._cur.mapModeIndex];
        var index = this._cur.mapIndex;
        var maps = this._cur[modelname];
        var mapindex = 0;
        for(let i = 0; i < maps.length; i++) {
            if(maps[i].name == this._cur.mapName) {
                mapindex = i;
                break;
            }
        }
        return maps[mapindex];
    }

    public saveWin (star: number, time: number) {

        time = Number(time.toFixed(4));

        var index = this._cur.mapIndex;
        if (index == undefined) {
            console.log(' ----- undefined map Index.');
            return;
        }
        var map = this.getModeMaps();
        if(map.score == undefined || (star > 0 && map.score <= star)) {
            map.score = star;
            map.state = MapStateEnum.pass;
            if(map.wintimes == undefined) map.wintimes = 0;
            map.wintimes++;
            this._cur.select_level = index;
            this.unlockConnect(index);
            this.calculateStar();
        }

        // Caculate best time that full star.
        if(map.score >= 3 && (map.bestfullstartime == undefined || map.bestfullstartime > time)) {
            map.bestfullstartime = time;
            Msg.emit('update_leader_board',{'name':map.name, 'time': map.bestfullstartime});
        }

        if(map.time == undefined || (time < map.time)) {
            map.time = time;
        }

        if(map.totaltime == undefined) map.totaltime = 0;
        map.totaltime += time;
    }

    public saveLose(time: number) {
        var index = this._cur.mapIndex;
        if (index == undefined) {
            console.log(' ----- undefined map Index.');
            return;
        }

        var map = this.getModeMaps();
        if(map.losetimes == undefined) map.losetimes = 0;
        map.losetimes++;

        if(map.totaltime == undefined) map.totaltime = 0;
        map.totaltime += time;
    }

    public calculateStar() {
        if(this._cur.mapModeIndex !== 0) return;
        var star = 0;
        for(var i = 0; i < this._cur.maps.length; i++) {
            var m = this._cur.maps[i];
            if(m.score != undefined)
                star += m.score;
        }

        this.setStatisticsTimes('star', star);
    }

    public nextMap () {
        if (this.isLastMap()) return;
        var maps = this._cur.maps;
        this._cur.mapIndex++;
        this.saveArchive();
    }

    public isLastMap () {
        return this._cur.mapIndex >= (this._cur.maps.length - 1);
    }

    public saveWorldMap(landdata:any) {

        var maps = this._cur.maps;
        for(var i = 0; i < maps.length; i++) {
            maps[i].connect = landdata[i].connect;
            maps[i].pre_connect = landdata[i].pre_connect;
            maps[i].pos = landdata[i].pos;
        }
        //console.log(maps);
        this.saveArchive();
    }


    // State == 0 lock.
    // State == 1 first unlock.
    // State == 2 unlock but not pass.
    // State == 3 pass level.
    public unlockConnect(index:number) {
        var maps = this._cur.maps;
        var connect = maps[index].connect; 
        for(var i = 0; i < connect.length; i++) {
            var c_idx = connect[i];
            var c_map = maps[c_idx];
            if(c_map.state != undefined) continue;
            var pre_connect = c_map.pre_connect;
            var state_count = 0;
            for(var j = 0; j < pre_connect.length; j++) {
                var p_idx = pre_connect[j];
                if(maps[p_idx].state == MapStateEnum.pass) state_count++;
            }
            // Check new unlock.
            if(state_count == pre_connect.length) {
                c_map.state = MapStateEnum.first_unlock;
            }
        }

    }

    public passFirstUnlcok(index:number) {
        var maps = this._cur.maps;
        maps[index].state = MapStateEnum.not_pass;
    }

    public clearByKey(key) {
        this._cur[key] = {};
        this.saveArchive();
    }

    public setStatisticsTimes(key:string, times:number) {
        if(this._cur.mapModeIndex !== 0) return;
        var statKey = key + 'Times'
        if(this._cur.statistics == undefined) this._cur.statistics = {};
        if(this._cur.statistics[statKey] == undefined) this._cur.statistics[statKey] = 0;
        this._cur.statistics[statKey] = times; 
        Electron.send('setStat', { 'name': statKey, 'value': times } );
    }

    public statisticsTimes(key:string) {
        if(this._cur.mapModeIndex !== 0) return;
        var statKey = key + 'Times'
        if(this._cur.statistics == undefined) this._cur.statistics = {};
        if(this._cur.statistics[statKey] == undefined) this._cur.statistics[statKey] = 0;
        this._cur.statistics[statKey] += 1;
        Electron.send('setStat', { 'name': statKey, 'value': this._cur.statistics[statKey] } );
    }

    public statisticsTime(key:string, time:number) {
        if(this._cur.mapModeIndex !== 0) return;
        var statKey = key + 'Time';
        if(this._cur.statistics == undefined) this._cur.statistics = {};
        if(this._cur.statistics[statKey] == undefined) this._cur.statistics[statKey] = 0; 
        this._cur.statistics[statKey] += time;
        Electron.send('setStat', { 'name': statKey, 'value': this._cur.statistics[statKey] } );
    }

    public statisticsValue(key:string): number {
        return this._cur.statistics[key];
    }

}

enum MapStateEnum {
    lock = 0,
    first_unlock = 1,
    not_pass = 2,
    pass = 3,
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

export interface IMap {
    name: string;
    score: number;
    path: string;
    verify: boolean;
}