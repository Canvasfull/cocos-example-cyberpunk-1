import { _decorator, Component, Node, Animation, Sprite, SpriteComponent, Color, Button, Tween } from 'cc';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

@ccclass('UIEnablePlay')
export class UIEnablePlay extends Component {

    @property
    speed = 1;

    @property
    delay_time = 0;

    @property
    enable_opacity = true;

    animation: Animation;

    btn: Button;

    onEnable () {

        if (this.animation === undefined)
            this.animation = this.getComponent(Animation);

        this.animation.stop();

        if (this.enable_opacity)
        this.node.getComponent(SpriteComponent).color = new Color(1, 1, 1, 0);

        if (this.btn === undefined)
            this.btn = this.getComponent(Button);

        if (this.btn) this.btn.enabled = false;

        fun.delay(() => {
            this.animation.defaultClip.speed = this.speed;
            this.animation.play();
        }, this.delay_time);

        fun.delay(() => {
            if (this.btn) this.btn.enabled = true;
        }, 2);

    }

}

