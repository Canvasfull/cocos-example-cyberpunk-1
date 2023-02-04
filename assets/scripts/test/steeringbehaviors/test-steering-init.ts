import { _decorator, Component, JsonAsset, Node } from 'cc';
import { NavigationPoint } from '../../logic/navigation/navigation-point';
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

