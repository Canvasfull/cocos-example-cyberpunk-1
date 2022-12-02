import { _decorator, Component, Node, UITransform, Layout } from 'cc';
import { fun } from '../../core/util/fun';
const { ccclass, property } = _decorator;

@ccclass('ui_svc_reset_pos')
export class ui_svc_reset_pos extends Component {

    @property
    delay = 0.3;

    onEnable() {
        fun.delay(()=>{
            //var reset_pos = this.node.position.y;
            //console.log('---------- svc resest pos:',reset_pos);
            //this.node.setPosition(0, reset_pos, 0);
            var layout = this.node.getComponent(Layout);
            layout.enabled = false;
            layout.enabled = true;
        },this.delay);
    }
}

