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

import { _decorator, Component, JsonAsset, Node } from 'cc';
import { NavSystem } from '../../logic/navigation/navigation-system';
import { ResCache } from '../../core/res/res-cache';

import * as dataCore from "../../logic/data/data-core";
import { Level } from '../../logic/level/level';
import { Actor } from '../../logic/actor/actor';
import { Sound } from '../../core/audio/sound';
import { Save } from '../../logic/data/save';

const { ccclass, property } = _decorator;

@ccclass('TestSteeringInit')
export class TestSteeringInit extends Component {

    @property(JsonAsset)
    jsonAsset:JsonAsset | undefined;

    @property(Node)
    enemiesNode:Node | undefined;

    //@property( { type:[Actor] } )
    //actors:Actor[] = [];

    @property( {type : Actor } )
    player:Actor | undefined;

    start() {

        NavSystem.Init(this.jsonAsset?.json);

        ResCache.Instance.load(()=>{

            const playerNode = this.node.getChildByName('player-tps');

            this.player = playerNode?.getComponent(Actor)!;

            dataCore.Init();

            Save.Instance.init();

            // Init player
            this.player?.init('data-player');

            // Set level player.
            Level.Instance._player = this.player;

            // Init sound.
            Sound.init();  

            // Init enemy actors.
            const enemies = this.enemiesNode?.getComponentsInChildren(Actor)!;
            for(let i = 0; i < enemies.length; i++) {
                enemies[i].init('data-enemy_0');
                enemies[i].isReady = true;
            }
        });

    }

    update(deltaTime: number) {
        
    }
}

