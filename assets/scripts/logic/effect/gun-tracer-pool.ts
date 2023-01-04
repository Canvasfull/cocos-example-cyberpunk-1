import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { Res } from '../../core/res/res';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('GunTracerPool')
export class GunTracerPool extends Component {

    @property
    poolCount = 20;

    pool:Array<Node> | undefined;

    index = 0;

    start() {

        this.pool = new Array(this.poolCount);

        const poolItem = this.node.children[0];
        this.pool[0] = poolItem;

        for(var i = 1; i < this.poolCount; i++) {
            this.pool[i] = Res.instNode(poolItem, this.node);
            this.pool[i].emit('init');
        }

        poolItem.emit('init');

        Msg.on('msg_set_tracer', this.setTracer.bind(this));

    }

    setTracer(data:{start:Vec3, end:Vec3}) {

        this.pool![this.index].emit('setTracer', data.start, data.end);

        this.index++;

        if(this.index >= this.poolCount) this.index = 0;

    }


}

