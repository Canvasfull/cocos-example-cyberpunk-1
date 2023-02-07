import { _decorator, Component, Node, Label, math, Sprite } from 'cc';
import { Msg } from '../../core/msg/msg';
import { UtilNode } from '../../core/util/util';
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
        console.log('start wait list:', this.waitList);
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
