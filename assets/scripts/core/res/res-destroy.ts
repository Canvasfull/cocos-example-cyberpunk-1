import { _decorator, Component, Node } from 'cc';
import { Msg } from '../msg/msg';
import { ILoadMsg } from '../../logic/ui/ui-loading';
const { ccclass, property } = _decorator;

@ccclass('ResDestroy')
export class ResDestroy extends Component {

    isDestroy = false;
    msg:ILoadMsg | undefined;

    start() {
        Msg.bind('msg_destroy_res', ()=>{
            this.isDestroy = true;
            const length = this.node.children.length - 1;
            this.msg = {
                id:0,
                action:'destroy',
                current:`${this.node.children[length].name}`,
                wait_count:length,
                count:length,
            }
            Msg.emit('msg_loading', this.msg);
        }, this);
    }

    update(deltaTime: number) {
        if(this.isDestroy) {
            const length = this.node.children.length - 1;
            this.msg!.wait_count = length;
            //this.msg!.current = this.node.children[length].name;
            if(length <= -1) {
                this.isDestroy = false;
                console.log('res is destroy');
                return;
            }
            this.node.children[length].destroy();
        }
    }
}

