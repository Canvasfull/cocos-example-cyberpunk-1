import { _decorator, Component, Node, UITransform, Layout } from 'cc';
import { fun } from '../../core/util/fun';
const { ccclass, property } = _decorator;

@ccclass('UIScrollViewResetPos')
export class UIScrollViewResetPos extends Component {

    @property
    delay = 0.3;

    onEnable() {
        fun.delay(()=>{
            //var reset_pos = this.node.position.y;
            
            //this.node.setPosition(0, reset_pos, 0);
            var layout = this.node.getComponent(Layout);
            layout.enabled = false;
            layout.enabled = true;
        },this.delay);
    }
}

