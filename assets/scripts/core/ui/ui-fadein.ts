import { _decorator, Component, Node, tween, Color, SpriteComponent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIFadeIn')
export class UIFadeIn extends Component {

    @property
    time = 1;

    @property
    startColor: Color = new Color();

    @property(Color)
    endColor: Color = new Color();

    _sprite: SpriteComponent = Object.create(null);

    onEnable () {
        this.tweenUpdateColor();
    }

    tweenUpdateColor () {
        if (this._sprite === null)
            this._sprite = this.getComponent(SpriteComponent);

        let bindTarget = new BindTarget();

        this._sprite.color = this.startColor;

        tween(bindTarget).by(this.time, { color: this.endColor }, {
            onUpdate (target: Color) {
                this._sprite.color = target;
            }
        }).start();
    }

    update (deltaTime: number) {

    }
}

class BindTarget {
    color: Color
}

