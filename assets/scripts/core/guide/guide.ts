import { Save } from "../../logic/data/save";
import { Singleton } from "../pattern/singleton";
import { ResCache } from "../res/res-cache";
import { Game } from "../../logic/data/game";
import { UI } from "../ui/ui";
import { Msg } from "../msg/msg";
import { Sound } from "../audio/sound";

export class Guide extends Singleton {

    _data:{} = {};
    _cur_index = -1;

    _guide_name = '';

    _cur:[] = null;
    _currentGameNodeName:string = '';
    _has_guide = false;

    public init() {

        // Test
        //Save.Instance._cur.guide_info = {};

        this._data = ResCache.Instance.getJson('data-guide').json;
        Msg.on('guide_story', ()=>{ this.set_guide('guide_story'); });
        Msg.on('guide_menu', ()=>{ this.set_guide('guide_menu'); });
        Msg.on('guide_build', ()=>{ this.set_guide('guide_build'); });
        Msg.on('guide_keyboard', ()=>{ this.set_guide('guide_keyboard'); });
        Msg.on('guide_gamepad', ()=>{ this.set_guide('guide_gamepad'); });

        Msg.on('guide_set', this.set_guide.bind(this));
        Msg.on('guide_next', this.next.bind(this));

        Msg.on('guide_force_set', this.guide_force_set.bind(this));
    }

    public set_guide(name:string) {
        this._guide_name = name;

        if (Save.Instance._cur.guide_info === undefined) 
            Save.Instance._cur.guide_info = {};

        if (Save.Instance._cur.guide_info[this._guide_name]){
            console.log('has guide:', this._guide_name);
            return;
        }
        this._has_guide = true;
        this._cur = this._data[this._guide_name];
        this._cur_index = -1;
        this.next();
        UI.Instance.on('uiguide');  
    }

    public guide_force_set(name:string) {
        this._guide_name = name; 
        this._has_guide = true;
        this._cur = this._data[this._guide_name];
        this._cur_index = -1;
        this.next();
        UI.Instance.on('uiguide');   
    }

    public next() {
        this._cur_index++;
        if (this._cur_index >= (this._cur.length - 1)) {
            // Close guide ui.
            UI.Instance.off('uiguide');
            Save.Instance._cur.guide_info[this._guide_name] = true;
            this._has_guide = false;
            var guide_end_event = this._cur[this._cur_index];
            if (guide_end_event !== '')
                Msg.emit(guide_end_event);
            Msg.emit('msg_save_archive');
        }else{
            this._currentGameNodeName = this._cur[this._cur_index];
            Msg.emit('guide_refresh');
        }
       
    }

}
