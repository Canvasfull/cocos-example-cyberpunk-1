import { _decorator, Component, Node, animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIEnablePlayAnimation')
export class UIEnablePlayAnimation extends Component {

    _animationGraph: animation.AnimationController;

    onEnable () {

        if (!this._animationGraph) {
            this._animationGraph = this.getComponent(animation.AnimationController);
        }

        this._animationGraph?.setValue('trigger_replay', true);

    }

}

