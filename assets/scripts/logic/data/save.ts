import { Singleton } from "../../core/pattern/singleton"
import { GMath } from '../../core/util/g-math';
import { IO } from "../../core/io/io";
import { UtilArray } from "../../core/util/util";
import { JsonTool } from "../../core/io/json-tool";
import { Msg } from "../../core/msg/msg";
import { Game } from "./game";
import { Notify } from "../../core/io/notify";
import { ResCache } from "../../core/res/res-cache";

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

    get PlayerID() {
        if (this._cur.player_id === undefined) this._cur.player_id = 27;
        return this._cur.player_id;
    }

    public init (): void {

        this._saveJson = ResCache.Instance.getJson('data-save').json;
        console.log(this._saveJson);
        if (!IO.exist(this._archiveKey + '.json')) {
            console.log('************ create new _archive key');
            this._archiveList = [];
            this.newArchive();
        } else {
            console.log('read archive.');
            this._archiveList = JsonTool.toIOObject(this._archiveKey);
            this._uuid = this._archiveList![0];
            this.loadArchive(this._uuid);
            console.log('read uuid key:', this._uuidKey);
            this._uuid = IO.read(this._uuidKey + '.json');
            console.log('load archive:', this._uuid);
        }
        //Msg.on('msg_stat_times', this.statisticsTimes.bind(this));
        //Msg.on('msg_stat_time', this.statisticsTime.bind(this));
        //Msg.on('msg_save_archive', this.saveArchive.bind(this));

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
        console.log(name, read_data);
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

    public getCurMap () {
        var index = this._cur.mapIndex;
        return this._cur.maps[index];
    }

    public getSelectIndex():number {
        if (this._cur.select_level === undefined)
            this._cur.select_level = 0;
        return this._cur.select_level; 
    }

    public getSelectedPos() {
        if (this._cur.select_level === undefined)
            this._cur.select_level = 0;
        return this._cur.maps[this._cur.select_level].pos;
    }

    public setMap (index: number, name: string) {
        this._cur.mapIndex = index;
        this._cur.mapName = name;
        this._cur.select_level = index;
        if (this._cur.select_index === undefined) {
            this._cur.select_index = [0,0,0];
        }
        this._cur.select_index[this._cur.mapModelIndex] = index;
        this.saveArchive();
    }

    public getModeMaps() {
        var modelName = Game.Instance._data.modes[this._cur.mapModeIndex];
        var index = this._cur.mapIndex;
        var maps = this._cur[modelName];
        var mapIndex = 0;
        for(let i = 0; i < maps.length; i++) {
            if (maps[i].name === this._cur.mapName) {
                mapIndex = i;
                break;
            }
        }
        return maps[mapIndex];
    }

    public saveWin (star: number, time: number) {

        time = Number(time.toFixed(4));

        var index = this._cur.mapIndex;
        if (index === undefined) {
            console.log(' ----- undefined map Index.');
            return;
        }
    }

    public saveLose(time: number) {
        var index = this._cur.mapIndex;
        if (index === undefined) {
            console.log(' ----- undefined map Index.');
            return;
        }
    }

    public calculateStar() {
        if (this._cur.mapModeIndex !== 0) return;
        var star = 0;
        for(var i = 0; i < this._cur.maps.length; i++) {
            var m = this._cur.maps[i];
            if (m.score !== undefined)
                star += m.score;
        }

        this.setStatisticsTimes('star', star);
    }

    // State === 0 lock.
    // State === 1 first unlock.
    // State === 2 unlock but not pass.
    // State === 3 pass level.
    public unlockConnect(index:number) {
        var maps = this._cur.maps;
        var connect = maps[index].connect; 
        for(var i = 0; i < connect.length; i++) {
            var c_idx = connect[i];
            var c_map = maps[c_idx];
            if (c_map.state !== undefined) continue;
            var pre_connect = c_map.pre_connect;
            var state_count = 0;
            for(var j = 0; j < pre_connect.length; j++) {
                var p_idx = pre_connect[j];
                if (maps[p_idx].state === MapStateEnum.pass) state_count++;
            }
            // Check new unlock.
            if (state_count === pre_connect.length) {
                c_map.state = MapStateEnum.first_unlock;
            }
        }

    }

    public clearByKey(key:string) {
        this._cur[key] = {};
        this.saveArchive();
    }

    public setStatisticsTimes(key:string, times:number) {
        if (this._cur.mapModeIndex !== 0) return;
        var statKey = key + 'Times'
        if (this._cur.statistics === undefined) this._cur.statistics = {};
        if (this._cur.statistics[statKey] === undefined) this._cur.statistics[statKey] = 0;
        this._cur.statistics[statKey] = times; 
    }

    public statisticsTimes(key:string) {
        if (this._cur.mapModeIndex !== 0) return;
        var statKey = key + 'Times'
        if (this._cur.statistics === undefined) this._cur.statistics = {};
        if (this._cur.statistics[statKey] === undefined) this._cur.statistics[statKey] = 0;
        this._cur.statistics[statKey] += 1;
    }

    public statisticsTime(key:string, time:number) {
        if (this._cur.mapModeIndex !== 0) return;
        var statKey = key + 'Time';
        if (this._cur.statistics === undefined) this._cur.statistics = {};
        if (this._cur.statistics[statKey] === undefined) this._cur.statistics[statKey] = 0; 
        this._cur.statistics[statKey] += time;
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