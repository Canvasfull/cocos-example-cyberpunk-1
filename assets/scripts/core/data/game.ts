import { Action } from "../action/action";
import { Singleton } from "../pattern/singleton";
import { UI } from '../../core/ui/ui';
import { Bind } from '../../logic/data/bind'
import { Local } from "../local/local";
import { Save } from "./save";
import { Msg } from "../msg/msg";
import { Stack } from "../util/data-structure";
import { ResCache } from "../res/res-cache";
import { Level } from "../../logic/level/level";
import { Sound } from "../audio/sound";
import { Notify } from "../io/notify";
import { GameQulity } from "../render/GameQulity";
import { DataEquip } from "./data-equip";


export const DataEquipInst = new DataEquip();

export class Game extends Singleton {

    _action: Action = null;
    _stack: Stack<string> = new Stack(5);

    _nodes: {} = Object.create(null);
    _data: {} = {};

    _isInit = false;
    
    _game_time = 0;
    _next_save_time = 20;
    _cur_name = '';

    _start_auto_save = false;

    /**
     * init 
     */
    public init (): void {

        Save.Instance.init();

        this._data = ResCache.Instance.getJson('data-game').json;
        this._action = new Action(this._data['action_data']);
        this._nodes = this._data['nodes'];

        DataEquipInst.init();
        
        GameQulity.Instance.init();
        //GM.init();
        Sound.init();
        //Guide.Instance.init();
        //Achievement.Instance.init();
        Local.Instance.init();
        //DebugUtil.Instance.init();
        Level.Instance.init();
        //World.Instance.init();
        Bind.Instance.init();
        Bind.Instance.initData(this._data['events']);
        UI.Instance.init();
        //Buff.Instance.init();

        // Register event.
        Msg.on('push', (key: string) => { Game.Instance.push(key); });
        Msg.on('root', (key: string) => { Game.Instance.root(key); });
        Msg.on('next', () => { Game.Instance.next() });
        Msg.on('back', () => { Game.Instance.back() });

        Msg.on('start_auto_save', () => {
            this._start_auto_save = true;
        });

        this.push(this._data['start_node']);
        this._isInit = true;
        Notify.Instance.check_notify();

        console.log('game init');

    }

    public next (): void {
        var cur = this._stack.cur();
        const nextAction = this._nodes[cur].next;
        if (nextAction) this.push(nextAction);
    }

    public back (): void {
        var prenode = this._stack.pop();
        this._action.off(prenode);
    }

    public root (name: string): void {
        var size = this._stack.size() - 1;
        for (var i = 0; i < size - 1; i++) {
            let pre = this._stack.pop();
            this._action.off(pre);
        }
    }

    public push (name: string) {

        this._cur_name = name;

        console.log('---push:', name, this._nodes[name]);
        if (!this._nodes[name].ispop && this._stack.size() > 0) {
            var pre = this._stack.pop();
            this._action.off(pre);
        }
        this._stack.push(name);
        this._action.on(name);
    }


    public update (deltaTime: number): void {

        if (!this._isInit) return;
        Game.Instance._action.update(deltaTime);
        Level.Instance.update(deltaTime);
        Bind.Instance.update(deltaTime);
        if(this._start_auto_save) {
            this._game_time += deltaTime;
            if(this._game_time > this._next_save_time) {
                Save.Instance.statisticsTime('game', Math.floor(this._game_time));
                this._next_save_time = 20; 
                this._game_time = 0;
            }
        }

    }

}
