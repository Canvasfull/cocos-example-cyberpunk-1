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

import { _decorator, Component, EventKeyboard, EventMouse, EventTouch, game, Input, input, KeyCode, v2, v3, Vec2 } from 'cc';
import { Msg } from '../msg/msg';
import { UtilVec2 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('InputEquipSelect')
export class InputEquipSelect extends Component {

    center:Vec2 = v2(0, 0);

    current:Vec2 = v2(0, 0);

    time_wait = 0.3;
    
    start() {
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        //input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.node.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }

    onTouchMove(event: EventTouch) {

        this.center.x = game.canvas!.width/2
        this.center.y = game.canvas!.height/2;

        UtilVec2.c(this.current, event.getLocation());
        this.current.subtract(this.center);

        Msg.emit('msg_select_equip', this.current.normalize());
    }

    onMouseMove(event: EventMouse) {

        this.center.x = game.canvas!.width/2
        this.center.y = game.canvas!.height/2;

        UtilVec2.c(this.current, event.getLocation());
        this.current.subtract(this.center);

        Msg.emit('msg_select_equip', this.current.normalize());
    }

}

