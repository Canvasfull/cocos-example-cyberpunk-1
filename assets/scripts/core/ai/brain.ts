
import { _decorator, Component, Node, random } from 'cc';
import { ResCache } from '../res/res-cache';
import { ActorBase } from '../actor/actor-base';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = brain
 * DateTime = Thu Jan 13 2022 18:27:58 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = brain.ts
 * FileBasenameNoExtension = brain
 * URL = db://assets/scripts/core/ai/brain.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
export class Brain {

    data = {};

    actor:ActorBase;

    constructor(data_path, _actor:ActorBase) {

        this.data = ResCache.Instance.getJson(data_path).json;
        this.actor = _actor;

    }

    update(deltaTime:number) {

    }

    runNode(data) {

        // find action.
        if(data.children == undefined) {
            this.action(data.action);
        }else{
            console.log('run node:', data.node);
            this[data.node](data.children);
        }

    }

    random(data) {
        var rand = random();
        for(let i = 0; i < data.length; i++) {
            let info = data[i];
            if(info.value < rand) {
                this.runNode(info);
                return;
            }
        }
        console.error('bad config data:', data);
    }

    condition(data) {

        console.log('condition:', data);

        for(let i = 0; i < data.length; i++) {
            let info = data[i];
            if(info.value == 'canEatPlayer') {
                this.runNode(info);
                return;
            }
        }

        console.log('bad logic desgin:', data);

    }

    sequence(data) {

        console.log('sequence:', data);

        for(let i = 0; i < data.length; i++) {
            let info = data[i];
            this.runNode(info);
        }

    }

    action(data) {

        console.log('do action:', data);
        this.actor.do(data);

    }
    
}