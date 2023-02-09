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

import { _decorator, Component, Node, Label, math, Sprite } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Game } from '../data/game';
const { ccclass, property } = _decorator;

@ccclass('UILoading')
export class UILoading extends Component {

    @property(Label)
    txtLoading:Label | undefined;

    @property(Sprite)
    img_loading_bar:Sprite | undefined;

    _percent = 0;
    _realPercent = 0;
    waitList:Record<number, ILoadMsg> = {};
    viewNode:Node | undefined;

    count = 0;
    wait_count = 0;
    current_msg = '';

    isLoading = false;

    start() {
        Msg.on('msg_loading', this.onWaitList.bind(this));
        this.viewNode = this.node.children[0];
    }

    onWaitList(data:ILoadMsg) {
        this.waitList[data.id] = data;
        this.isLoading = true;
        this.viewNode!.active = true;
        this._percent = 0;
    }

    update(deltaTime: number) {

        if(!this.isLoading) return;

        this.calculateLoading();
        this._percent = math.lerp(this._percent, this._realPercent, deltaTime);
        this.txtLoading!.string = this.current_msg;
        this.img_loading_bar!.fillRange = this._percent;

        if(this._percent >= 0.9999) {
            this.onLoadFinished();
        }
        
    }

    onLoadFinished() {
        this.isLoading = false;
        this.viewNode!.active = false;

        // If current is menu replay animation.
        if(Game.Instance._currentGameNodeName === 'menu')
            Msg.emit('msg_play_animation');

    }

    calculateLoading() {
        this.count = 0;
        this.wait_count = 0;
        this.current_msg = '';
        for(let k in this.waitList) {
            const waitMsg = this.waitList[k];
            this.count += waitMsg.count;
            this.wait_count += this.wait_count;
            if(this.wait_count > 0) {
                this.current_msg = `${waitMsg.action} ${waitMsg.current}`;
            }
        }
        this._realPercent = (this.count - this.wait_count)/this.count;
    }

}

export interface ILoadMsg {
    id:number,
    action:string,
    current:string,
    wait_count:number,
    count:number,
}
