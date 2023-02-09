import { _decorator, Component, Node, SpriteComponent, Color, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoystickAutoHidden')
export class JoystickAutoHidden extends Component {


    @property
    smooth = 5;

    @property
    hidden_delay_time = 3;

    @property
    hidden_alpha = 100;

    _color = new Color(0, 0, 0, 1);

    _isHidden = false;

    _sprite:SpriteComponent | undefined

    _alpha = 255;

    _cur_alpha = 255;

    _delay = 0;

    start() {
        this._sprite = this.getComponent(SpriteComponent)!;
        this.node.on('autoHidden', this.autoHidden, this);
        this._delay = this.hidden_delay_time;

        this._cur_alpha = this.hidden_alpha;
        this._color.a = this._cur_alpha;
        this._sprite.color = this._color;
    }

    update(deltaTime: number) {

        this._delay -= deltaTime;
        if (this._delay < 0) {
            this._cur_alpha = math.lerp(this._cur_alpha, this._alpha, deltaTime * this.smooth);
            this._color.a = this._cur_alpha;
            this._sprite!.color = this._color;
        }
        
    }

    autoHidden(isHidden:boolean) {
        this._isHidden = isHidden;
        this._alpha = this._isHidden ? this.hidden_alpha : 255;
        this._delay = this._isHidden ? this.hidden_delay_time : 0;
    }
}

