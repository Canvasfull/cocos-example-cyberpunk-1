import { Action } from "../../core/action/action";
import { Singleton } from "../../core/pattern/singleton";
import { UI } from '../../core/ui/ui';
import { Bind } from './bind'
import { Local } from "../../core/localization/local";
import { Save } from "./save";
import { Msg } from "../../core/msg/msg";
import { Stack } from "../../core/util/data-structure";
import { ResCache } from "../../core/res/res-cache";
import { Level } from "../level/level";
import { Sound } from "../../core/audio/sound";
import { Notify } from "../../core/io/notify";
import { GameQuality as GameQuality } from "./GameQuality";

import * as dataCore from "./data-core";

export class Game extends Singleton {

    _action: Action | undefined;
    _stack: Stack<string> = new Stack(5);

    _nodes: { [key:string]:any } = {};
    _data: { [key:string]:any } = {};

    _isInit = false;
    
    _game_time = 0;
    _next_save_time = 20;
    _cur_name = '';

    _start_auto_save = false;

    public init (): void {

        Save.Instance.init();

        this._data = ResCache.Instance.getJson('data-game').json;
        this._action = new Action(this._data.action_data);
        this._nodes = this._data['nodes'];

        dataCore.Init();

        GameQuality.Instance.init();
        //GM.init();
        Sound.init();
        //Guide.Instance.init();
        //Achievement.Instance.init();
        Local.Instance.init();
        Level.Instance.init();
        Bind.Instance.init();
        Bind.Instance.initData(this._data['events']);
        UI.Instance.init();

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
        const preNode = this._stack.pop();
        this._action!.off(preNode);
    }

    public root (name: string): void {
        var size = this._stack.size() - 1;
        for (var i = 0; i < size - 1; i++) {
            let pre = this._stack.pop();
            this._action!.off(pre);
        }
    }

    public push (name: string) {
        this._cur_name = name;
        if (!this._nodes[name].is_pop && this._stack.size() > 0) {
            var pre = this._stack.pop();
            this._action!.off(pre);
        }
        this._stack.push(name);
        this._action!.on(name);
    }


    public update (deltaTime: number): void {

        if (!this._isInit) return;
        Game.Instance._action.update(deltaTime);
        Level.Instance.update(deltaTime);
        Bind.Instance.update(deltaTime);
        
        if (this._start_auto_save) {
            this._game_time += deltaTime;
            if (this._game_time > this._next_save_time) {
                Save.Instance.statisticsTime('game', Math.floor(this._game_time));
                this._next_save_time = 20; 
                this._game_time = 0;
            }
        }

    }

}
