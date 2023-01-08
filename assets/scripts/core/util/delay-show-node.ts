import { _decorator, Component, Node, Vec3, v3 } from 'cc';
import { fun } from './fun';
import { UtilVec3 } from './util';
const { ccclass, property } = _decorator;

@ccclass('delay_show_node')
export class delay_show_node extends Component {

    @property
    delay_time = 0.2;

    _scale = v3(0, 0, 0);

    onEnable () {
        UtilVec3.copy(this._scale, this.node.getWorldScale());
        this.node.setScale(0, 0, 0);
    }

    start () {

        fun.delay(() => {
            this.node.setScale(this._scale);
        }, this.delay_time);

    }
}

