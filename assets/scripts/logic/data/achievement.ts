import { _decorator, Component, Node } from 'cc';
import { UtilTime } from '../../core/util/util';
import { Save } from './save';
import { Singleton } from '../../core/pattern/singleton';
import { DataGameInst } from './data-core';
const { ccclass, property } = _decorator;

@ccclass('Achievement')
export class Achievement extends Singleton {

    public percent:number = 0;

    public unlockAllAchi = false;

    public init() {

        var achievement = DataGameInst._data['achievement'];
        
        var achi_save = Save.Instance.get('achievement');

        //if (achi_save === undefined) {
            Save.Instance._cur['achievement'] = {};
            achi_save = Save.Instance.get('achievement');
        //} 

        for(let i = 0; i < achievement.length; i++) {
            var arch = achievement[i];
            var arch_save = achi_save[arch.name];
            if (arch_save === undefined) achi_save[arch.name] = { "name":arch.name,"condition":arch.condition,"value":arch.value,"percent":0,"stat_value":0 };
        }

        Save.Instance._cur['achievement'] = achi_save;

        this.updateData();

        

    }

    public totalTime():string {
        var time = Save.Instance.statisticsValue('level_playTime');
        if (time === undefined) time = 0;
        time = UtilTime.toHours(time);
        return `${time}`;
    }

    public totalPercent():number {
        return this.percent;
    }

    public getAchi(key:string) {
        var achievement = Save.Instance.get('achievement');
        return achievement[key]; 
    }

    public updateData() {

        var achi_save = Save.Instance.get('achievement');
        var statistics = Save.Instance.get('statistics');

        if (Save.Instance.get('achi_percent') === 1) return;

        var count = 1;

        //achi_save.forEach(arch => {

        for(const key in achi_save) {

            var achi = achi_save[key];

            if (achi['percent'] !== 1) {

                var stat_value = statistics[achi.value];

                if (stat_value === undefined) continue;

                if (stat_value > achi.condition) stat_value = achi.condition;
    
                achi['stat_value'] = stat_value;
    
                var arch_percent = stat_value / achi.condition;            
    
                achi['percent'] = arch_percent;
    
                achi['unlock_time'] = UtilTime.yearMonth();
    
                
            }
            
            this.percent += achi['percent'];
            count++;

        };

        this.percent /= count;

        this.unlockAllAchi = this.percent === 1;

        Save.Instance._cur['achi_percent'] = this.percent;

    }

}

