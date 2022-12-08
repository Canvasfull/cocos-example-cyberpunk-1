import { _decorator, Component, Node, animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIAnimation')
export class ui_animation extends Component {

    _graph: animation.AnimationController | undefined | null;

    onEnable () {
        this._graph = this.getComponent(animation.AnimationController);
        
        if (this._graph === null) {
            throw new Error(`${this.node.name} node can not find AnimationController.`);
        }

        this.node.on('set_anim', this.play, this);
    }

    play (key: string, value: boolean | number) {
        this._graph!.setValue(key, value);
    }
}

