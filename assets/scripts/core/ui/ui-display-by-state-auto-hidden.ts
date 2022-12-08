import { _decorator, Component, Node } from 'cc';
import { UIDisplayByState } from './ui-display-by-state';
const { ccclass, property } = _decorator;

@ccclass('UIDisplayByStateAutoHidden')
export class UIDisplayByStateAutoHidden extends UIDisplayByState {
    
    @property
    hiddenTime = 5;

    _hiddenTime = 5;

    onChangeState(value:number) {
        super.onChangeState(value);
        this._hiddenTime = this.hiddenTime;
    }

    update(deltaTime: number) {

        super.update(deltaTime);

        if (this._hiddenTime < 0) return;

        this._hiddenTime -= deltaTime;

        if (this._hiddenTime < 0) {
            this._color_a = 0;
        }

    }
}

