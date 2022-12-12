import { _decorator } from 'cc';
import { Action } from '../../core/action/action';
import { Singleton } from '../../core/pattern/singleton';
import { ResCache } from '../../core/res/res-cache';
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
        if (this._action) this._action.on(name);
    }

    worldLogic() {

    }

}

