import { setDisplayStats } from "cc";
import { Game } from "../data/game";
import { Save } from "../data/save";
import { Local } from "../local/local";
import { Msg } from "../msg/msg";
import { Singleton } from "../pattern/singleton";

export class DebugUtil extends Singleton {

    index: number = 0;

    public init (): void {

        if(Save.Instance._cur.debugIndex == undefined) 
            Save.Instance._cur.debugIndex = 0;

        this.index = Save.Instance._cur.debugIndex;
        var gdata = Game.Instance._data;

        this.CheckDisplayStats();

        Msg.on('next_debug', () => {
            this.index++;
            if(this.index >= gdata.debug_info.length) this.index = 0;
            Save.Instance._cur.debugIndex = this.index;
            this.CheckDisplayStats();
        });

        Msg.on('pre_debug', () => {
            this.index--;
            if(this.index < 0) this.index = gdata.debug_info.length - 1;
            Save.Instance._cur.debugIndex = this.index;
            this.CheckDisplayStats();
        });

    }

    public CheckDisplayStats() {
        setDisplayStats(this.index == 1);
    }

    public getShowName() {
        var gdata = Game.Instance._data;
        return Local.Instance.get(gdata.debug_info[this.index]);
    } 

}