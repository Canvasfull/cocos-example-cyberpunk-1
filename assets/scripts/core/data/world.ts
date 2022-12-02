import { _decorator, Component, Node } from 'cc';
import { Action } from '../action/action';
import { Singleton } from '../pattern/singleton';
import { ResCache } from '../res/res-cache';
const { ccclass, property } = _decorator;

@ccclass('World')
export class World extends Singleton {

    _data = Object.create(null);
    _action: Action = null;
    
    public init(): void {
        
        this._data = ResCache.Instance.getJson('data-actor-world').json;
        this._action = new Action(this._data['action']);

    }

    do(name: string) {
        if(this._action) this._action.on(name);
    }

    worldLogic() {

    }

}

