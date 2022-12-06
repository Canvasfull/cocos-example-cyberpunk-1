import { _decorator, Node, game, director } from 'cc';
import { Singleton } from "../pattern/singleton";
import { Log } from "../io/log";
import { UIBase } from "./ui-base";
import { Res } from "../res/res";
import { find } from "cc";
import { Msg } from '../msg/msg';
import { Game } from '../../core/data/game';

export class UI extends Singleton {
    private _map: { [name: string]: UIBase } = {};
    public node: Node = null;
    public init() {
        this.node = find('init/canvas');
        director.addPersistRootNode(this.node);
        Msg.on('refresh_ui', this.refresh.bind(this));
    }

    public refresh() {
        for(let key in this._map) {
            this._map[key].refresh();
        }
    }

    public on(name: string) {
        var load = async ()=>{
            const panel = this._map[name];
            if(panel) {
                panel.on();
            }else{
                Res.loadPrefab('ui/'+name,(err, asset)=>{
                    if(asset) {
                        const panel = Res.inst(asset, UI.Instance.node);
                        const order = Game.Instance._data.ui_order[name];
                        panel.setPosition(0, 0, order);
                        let set = false;
                        var count = UI.Instance.node.children.length;
                        for(let i = 1; i < count; i++) {
                            let child = this.node.children[i];
                            if(child.position.z > order) {
                                let ui_order = i;
                                panel.setSiblingIndex(ui_order); 
                                set = true;
                                break;
                            }
                        }
                        if(!set) panel.setSiblingIndex(count);
                        const uiBase = new UIBase(panel);
                        uiBase.on();
                        this._map[name] = uiBase;
                        
                    }else{
                        Log.warn('Can not load res : ' + name);
                    }
                });
            }
        };
        load();
    }

    public off(name: string) {
        const panel = this._map[name];
        if(panel) {
            panel.off();
        }else{
            Log.warn('You want off a ui object that does not exist : ' + name);
        }
    }
    
    public destroy(name: string) {
        const panel = this._map[name];
        if(panel) {
            panel.destroy();
            this._map[name] = null;
        }else{
            Log.warn('You want destroy a ui object that does not exist. - ' + name);
        }
    }

}