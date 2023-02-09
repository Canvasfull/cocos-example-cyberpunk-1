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

import { _decorator, Node, game, director, Camera } from 'cc';
import { Singleton } from "../pattern/singleton";
import { Log } from "../io/log";
import { UIBase } from "./ui-base";
import { Res } from "../res/res";
import { find } from "cc";
import { Msg } from '../msg/msg';
import { UtilNode } from '../util/util';
import { DataGameInst } from '../../logic/data/data-core';

export class UI extends Singleton {
    private _map: { [name: string]: UIBase } = {};
    public node: Node | undefined | null;
    public panelRoot: Node | undefined;
    public camera: Camera | undefined;

    public init() {
        this.node = find('init/canvas'); 

        this.panelRoot = UtilNode.getChildByName(this.node!, 'panels');
        if(this.node === undefined || this.node == null) {
            throw new Error(`can not find canvas ui root.`);
        }
        director.addPersistRootNode(this.node!);
        Msg.on('refresh_ui', this.refresh.bind(this));

        this.camera = this.node?.getChildByName('Camera')?.getComponent(Camera)!;
    }

    public refresh() {
        for(let key in this._map) {
            this._map[key].refresh();
        }
    }

    public on(name: string) {

        var load = async ()=>{
            const panel = this._map[name];
            if (panel) {
                panel.on();
            }else{
                Res.loadPrefab('ui/'+name,(err, asset)=>{
                    if (asset) {
                        const panel = Res.inst(asset, UI.Instance.panelRoot);
                        const order = DataGameInst._data.ui_order[name];
                        panel.setPosition(0, 0, order);
                        let set = false;
                        var count = UI.Instance.panelRoot.children.length;
                        for(let i = 1; i < count; i++) {
                            let child = this.panelRoot!.children[i];
                            if (child.position.z > order) {
                                let ui_order = i;
                                panel.setSiblingIndex(ui_order); 
                                set = true;
                                break;
                            }
                        }
                        if (!set) panel.setSiblingIndex(count);
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
        if (panel) {
            panel.off();
        }else{
            Log.warn('You want off a ui object that does not exist : ' + name);
        }
    }
    
    public destroy(name: string) {
        const panel = this._map[name];
        if (panel) {
            panel.destroy();
            this._map[name] = undefined;
        }else{
            Log.warn('You want destroy a ui object that does not exist. - ' + name);
        }
    }

}