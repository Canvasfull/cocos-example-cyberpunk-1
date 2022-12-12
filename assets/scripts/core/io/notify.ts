import { _decorator} from 'cc';
import { Game } from '../../logic/data/game';
import { Msg } from '../msg/msg';
import { Singleton } from '../pattern/singleton';
import { Queue } from '../util/data-structure';

export class Notify extends Singleton {

    queue:Queue<INotify> = new Queue();
    cur:INotify = null;
    counter = 0;

    public push(title:string, info:string, fun: ()=>void = null) {

        this.queue.push({
            'title':title,
            'info':info,
            'call':fun
        });
        
        this.counter++;
        
        if (Game.Instance._isInit) this.check_notify();

        Msg.on('msg_check_notify', this.check_notify.bind(this));
    }

    public check_notify() {

        if (this.cur !== null && this.cur.call !== null) {
            this.cur.call();
        }

        if (this.counter === 0) return;

        if (this.queue.empty()) {
            this.counter = 0;
            this.cur = null;
        }else{
            this.cur = this.queue.pop();
            Msg.emit('push', 'notify');
        }
    }


}

export interface INotify {
    title:string,
    info:string,
    call:Function
}
