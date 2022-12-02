import { _decorator, Component, Node, Vec3, v3 } from 'cc';
import { Msg } from '../../core/msg/msg';
import { u3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('SmoothLocalZ')
export class SmoothLocalZ extends Component {

    @property
    smooth: number = 0.5;

    @property
    wait: number = 1;

    pos: Vec3 = v3(0, 0, 0);

    cur: Vec3 = v3(0, 0, 0);

    offset: number = 0;

    offset_x: number = 0;

    original: Vec3 = v3(0, 0, 0);

    /*
    start () {
        u3.c(this.pos, this.node.position);
        u3.c(this.original, this.pos);
        this.pos.z = this.offset + this.original.z;
        u3.c(this.cur, this.pos);
        this.cur.z = 30;
        this.node.setPosition(this.cur);
        Msg.on('set_offset_x', this.setOffsetX.bind(this));
    }
    */

    init() {
        u3.c(this.pos, this.node.position);
        u3.c(this.original, this.pos);
        this.pos.z = this.offset + this.original.z;
        u3.c(this.cur, this.pos);
        this.cur.z = 30;
        this.pos.z = 30;
        this.node.setPosition(this.cur);
        Msg.on('set_offset_x', this.setOffsetX.bind(this)); 
    }

    onDestroy () {
        Msg.off('set_offset_x', this.setOffset.bind(this));
    }

    setOffset (offset: number) {
        this.offset = offset;
        this.pos.z = this.offset + this.original.z;
        //console.log(' set offset:', offset, this.pos);
    }

    setOffsetX (offset: number) {
        this.pos.x = offset + this.original.x;
    }

    lateUpdate (deltaTime: number) {
        if(this.wait > 0) {
            this.wait -= deltaTime;
            return;
        }
        this.smoothLerp(deltaTime);
    }

    smoothLerp (deltaTime: number) {
        Vec3.lerp(this.cur, this.cur, this.pos, deltaTime * this.smooth);
        this.node.setPosition(this.cur);
    }
}

