import { _decorator, Component, Node, Color, math, Sprite, SpriteComponent } from 'cc';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('UIDisplayByState')
export class UIDisplayByState extends Component {

    _color_a = 0;
    _color:Color = new Color(0, 0, 0, 0);

    @property(Number)
    smooth:number = 5.0;

    _sprite:Sprite | undefined;

    start() {

        this._sprite = this.getComponent(SpriteComponent)!;
        Msg.bind(`msg_${this.node.name}`, this.onChangeState, this);

    }

    onDestroy() {
        Msg.off(`msg_${this.node.name}`, this.onChangeState);
    }

    onChangeState(value:number) {
        this._color_a = value;
    }

    update(deltaTime: number) {

        this._color.a = math.lerp(this._color.a, this._color_a, deltaTime * this.smooth);

        this._sprite!.color = this._color;
        
    }
}

