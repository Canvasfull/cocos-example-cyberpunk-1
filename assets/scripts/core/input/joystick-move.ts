import { _decorator, Component, Node, Vec3, input, Input, EventTouch, v3, Vec2, v2, Rect, math, UITransform, game } from 'cc';
import { Msg } from '../msg/msg';
import { InputJoystick } from './input-joystick';
const { ccclass, property } = _decorator;

@ccclass('JoystickMove')
export class JoystickMove extends Component {

    @property(Number)
    radius = 20;

    @property(Number)
    smooth = 5;

    @property(Number)
    damping_smooth = 10;

    @property(Vec2)
    centerOffset:Vec2 = v2(0, 0)

    @property(Number)
    damping_a = 0.5;

    @property(Number)
    damping_e_a = 5;

    @property(Rect)
    range:Rect = new Rect(100, 100, 300, 300);

    @property(Boolean)
    autoHidden:Boolean = false
    

    @property
    msg_move = '';

    offset_euler = -45;

    _center:Vec3 = v3(0, 0, 0);

    _pos:Vec3 = v3(0, 0, 0);

    _movePos:Vec3 = v3(0, 0, 0);

    _tempMove:Vec3 = v3(0, 0, 0);

    _moveNode:Node;
    _bgNode:Node;

    _value = 0;

    _start = false;

    _t = 0;

    _input:InputJoystick;

    start() {

        //bind input joystick

        this._input = this.node.parent.getComponent(InputJoystick);

        this._moveNode = this.node.children[1];
        this._bgNode = this.node.children[0];
        Vec3.copy(this._center, this._moveNode.worldPosition);
        Vec3.copy(this._movePos, this._center);
        Vec3.copy(this._pos, this._center);
        Vec3.copy(this._tempMove, this._center);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        var bgHalfSize = this._bgNode.getComponent(UITransform).contentSize.width/2;
        var uitran = this.node.getComponent(UITransform);
        this.range.x = bgHalfSize;
        this.range.y = bgHalfSize;
        this.range.width = uitran.contentSize.width - bgHalfSize;
        this.range.height = uitran.contentSize.height - bgHalfSize;

        this.offset_euler *= Math.PI / 180;

    }

    onDestroy() {
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this); 
    }

    onTouchStart(event: EventTouch) {

        this._start = true;
        
        this._center.x = event.getLocationX() + this.centerOffset.x;
        this._center.y = event.getLocationY() + this.centerOffset.y;

        if (this._center.x < this.range.x) this._center.x = this.range.x;
        if (this._center.x > (this.range.x + this.range.width)) this._center.x = this.range.x + this.range.width;
        if (this._center.y < this.range.y) this._center.y = this.range.y;
        if (this._center.y > this.range.y + this.range.height) this._center.y = this.range.y + this.range.height;

        Vec3.copy(this._pos, this._center);
        Vec3.copy(this._movePos, this._center);
        this._bgNode.setWorldPosition(this._center.x, this._center.y, 0);
        this._moveNode.setPosition(0, 0, 0);

        if (this.autoHidden) this.node.emit('autoHidden', false);

    }

    onTouchMove(event: EventTouch) {

        this._tempMove.x = event.getLocationX() + this.centerOffset.x;
        this._tempMove.y = event.getLocationY() + this.centerOffset.y;
        this._tempMove.z = 0;

        this._tempMove = this._tempMove.subtract(this._center);
        
        this._tempMove.z = 0;
        var len = this._tempMove.length();
        if (len > this.radius) {
            this._tempMove.normalize().multiplyScalar(this.radius).add(this._center);
            this._tempMove.z = 0;
            this._pos.x = this._tempMove.x;
            this._pos.y = this._tempMove.y;
            this._tempMove.subtract(this._center);
        }else{
            this._pos.x = event.getLocationX();
            this._pos.y = event.getLocationY();
        }

        this._tempMove.z = -this._tempMove.y;
        this._tempMove.y = 0;
        this._tempMove.multiplyScalar(1/this.radius);
        Vec3.rotateY(this._tempMove, this._tempMove, Vec3.ZERO, this.offset_euler);

        this._input?.onMove(this._tempMove);

    }

    onTouchEnd(event: EventTouch) {

        console.log('on touch end');

        this._start = false;

        this._pos.x = this._center.x;
        this._pos.y = this._center.y;

        this._t = 0;

        this._input?.onMove(this._tempMove.multiplyScalar(1/1000));

        if (this.autoHidden) this.node.emit('autoHidden', true);

    }

    onTouchCancel(event: EventTouch) {
       
        console.log('on touch cancel');

        this._start = false;

        this._pos.x = this._center.x;
        this._pos.y = this._center.y;

        this._t = 0;

        this._input?.onMove(this._tempMove.multiplyScalar(1/1000));

        if (this.autoHidden) this.node.emit('autoHidden', true);

    }

    update(deltaTime: number) {

        if (this._start) {
            Vec3.lerp(this._movePos, this._pos, this._movePos, deltaTime * this.smooth);
            this._moveNode.setWorldPosition(this._movePos.x, this._movePos.y, 0);
        }else{
            this._t += deltaTime;
            var x = this.math_Damping(this._movePos.x - this._pos.x, this._t * this.damping_smooth);
            var y = this.math_Damping(this._movePos.y - this._pos.y, this._t * this.damping_smooth);
            this._moveNode.setWorldPosition(x + this._pos.x, y + this._pos.y, 0);
        }
        
    }

    /**
     * y = scale * e^(-t) * cos(a * pi * t)
     */
    math_Damping(scale: number, t:number):number {
        return scale * Math.exp(-t * this.damping_e_a) * Math.cos(this.damping_a * Math.PI * t);
    }
}

