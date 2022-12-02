import { _decorator, Node, game, director } from 'cc';
import { Singleton } from "../pattern/singleton";
import { Log } from "../io/log";
import { UIBase } from "./ui-base";
import { Res } from "../res/res";
import { find } from "cc";
import { Msg } from '../msg/msg';
import { Game } from '../../core/data/game';
import { TaskRuner } from '../task/task';

/**
 * 
 */
export class UI extends Singleton {

    private _map: { [name: string]: UIBase } = {};
    public node: Node = null;

    public init() {
        //Log.info('init ui.');
        this.node = find('canvas');
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
                        var objpanel = Res.inst(asset, UI.Instance.node);
                        //console.log(Game.Instance._data.ui_order);
                        var order = Game.Instance._data.ui_order[name];
                        objpanel.setPosition(0, 0, order);
    
                        // Insert ui.
                        let set = false;
                        var count = UI.Instance.node.children.length;
                        for(let i = 1; i < count; i++) {
                            let tui = this.node.children[i];
                            //console.log('ui order log:', tui.name, tui.position.z, order);
                            if(tui.position.z > order) {
                                let ui_order = i;
                                objpanel.setSiblingIndex(ui_order);
                                //console.log('ui order set:', tui.position.z, objpanel.position.z, ui_order, this.node.children);
                                set = true;
                                break;
                            }
                        }
    
                        if(!set) {
                            objpanel.setSiblingIndex(count);
                        }
    
                        //console.log('ui order:', this.node.children);
    
                        var uipanel = new UIBase(objpanel);
                        uipanel.on();
                        this._map[name] = uipanel;
                        
                    }else{
                        Log.warn('Can not load res. - ' + name);
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
            Log.warn('You want off a ui object that does not exist. - ' + name);
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