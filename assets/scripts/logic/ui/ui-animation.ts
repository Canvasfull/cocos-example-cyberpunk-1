import { _decorator, Component, Node, animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ui_animation')
export class ui_animation extends Component {

    _graph: animation.AnimationController;

    onEnable () {
        this._graph = this.getComponent(animation.AnimationController);
        this.node.on('set_anim', this.play, this);
    }

    play (key: string, value: boolean | number) {
        this._graph.setValue(key, value);
    }
}

