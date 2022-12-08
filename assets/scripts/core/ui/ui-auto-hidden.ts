import { _decorator, Component, Node, Color, Sprite, SpriteComponent, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UiAutoHidden')
export class UiAutoHidden extends Component {
    _color_a = 0;

    _color:Color = new Color(255, 255, 255, 0);

    @property(Number)
    smooth:number = 5;

    @property(Number)
    wait:number = 3;

    _sprite:Sprite;
    _wait:number = 3;

    __preload() {

        this._sprite = this.getComponent(SpriteComponent);
        this._sprite.color = this._color;

    }

    onEnable() {
        this.setDisplay(255);
    }

    setDisplay(value:number) {
        
        if (value === 255) {
            this._color.a = value;
            this._sprite.color = this._color;
            this._color_a = 0;
        }

        this._wait = this.wait;
    }

    update(deltaTime: number) {

        this._wait -= deltaTime;
        if (this._wait > 0) return;

        this._color.a = math.lerp(this._color.a, this._color_a, deltaTime * this.smooth);
        this._sprite.color = this._color;

        if (this._color.a <= 0.01) {
            this.node.active = false;
        }
        
    }
}

