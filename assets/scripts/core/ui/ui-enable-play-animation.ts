import { _decorator, Component, Node, CCObject, animation, AnimationComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ui_enable_play_animation')
export class ui_enable_play_anim extends Component {

    _anim: AnimationComponent;

    onEnable () {

        if (!this._anim) {
            this._anim = this.getComponent(AnimationComponent);
        }

        this._anim.play();

        console.log('onEnable play');
    }

}
