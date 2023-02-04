import { _decorator, Component, input, Input, EventMouse, SpriteComponent, Color, Button, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMoveShow')
export class UIMoveShow extends Component {

    @property
    hiddenTime:number = 1;

    @property
    showSpeed:number = 0.3;

    @property
    hiddenSpeed:number = 0.3;

    _curTime = 0;

    _sprite:SpriteComponent | undefined | null;

    _color:Color = new Color(255, 255, 255, 0);

    _a:number = 0;

    _btn:Button | undefined | null;
    
    start() {

        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this._sprite = this.getComponent(SpriteComponent);
        this._sprite!.color = this._color;
        this._curTime = this.hiddenTime;
        this._btn = this.getComponent(Button);

    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onMouseMove(event: EventMouse) {
        this._curTime = 0;
    }
    
    onTouchMove(event: EventTouch) {
        this._curTime = 0;
    }

    update(deltaTime: number) {

        this._curTime += deltaTime;

        if (this._curTime > this.hiddenTime) {
            if (this._color.a > 0) {
                var delta = deltaTime * this.hiddenSpeed;
                this._color.a -= delta;
                this._sprite!.color = this._color.clone();
                this._btn!.enabled = false;
            }
        }else{
            if (this._color.a < 255) {
                var delta = deltaTime * this.showSpeed;
                this._color.a += delta;
                this._sprite!.color = this._color.clone();
                this._btn!.enabled = true;
            }
            
        }
        
    }
}
