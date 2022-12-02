import { _decorator, Component, Node, animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ui_enable_play_anim')
export class ui_enable_play_anim extends Component {

    _anim_graph: animation.AnimationController;

    onEnable () {

        if (!this._anim_graph) {
            this._anim_graph = this.getComponent(animation.AnimationController);
        }

        this._anim_graph?.setValue('trigger_replay', true);

    }

}

