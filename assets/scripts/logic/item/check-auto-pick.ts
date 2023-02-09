import { _decorator, Component, Node, sys } from 'cc';
import { Actor } from '../actor/actor';
const { ccclass } = _decorator;

@ccclass('CheckAutoPick')
export class CheckAutoPick extends Component {

    _actor:Actor | undefined;

    // auto pick check time.
    checkAutoPickTime = 1;

    isAutoPick = false;

    start() {

        this._actor = this.getComponent(Actor)!;

        this.isAutoPick =  sys.platform === sys.Platform.MOBILE_BROWSER || 
                            sys.platform === sys.Platform.ANDROID ||
                            sys.platform === sys.Platform.IOS; 

    }

    update(deltaTime: number) {

        if(!this.isAutoPick) return;
        
        this.checkAutoPickTime -= deltaTime;

        if(this.checkAutoPickTime > 0) return;

        this.checkAutoPickTime = 1;
        
        this._actor?.onPick();

    }
}

