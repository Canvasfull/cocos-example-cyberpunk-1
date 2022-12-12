import { _decorator, Component, Node, Vec3, v3, v2, Vec2, UITransform, EventTouch, random, math } from 'cc';
import { type_x_y } from '../../logic/data/game-type';
const { ccclass, property } = _decorator;

@ccclass('Slider2D')
export class Slider2D extends Component {
    pos: Vec3 = v3(0, 0, 0);
    uipos: Vec2 = v2(0, 0);
    point: Node = Object.create(null);
    uitran: UITransform = Object.create(null);

    size: Vec2 = v2(0, 0);
    halfx: number = 0;
    halfy: number = 0;

    px: number = 0;
    py: number = 0;

    children: Node[] = Object.create(null);

    start() {

        this.node.on(Node.EventType.TOUCH_MOVE, this.onMove, this);
        this.point = this.node.children[0].children[0];
        this.children = this.point.children;
        this.uitran = this.node.getComponent(UITransform);
        this.size.x = this.uitran.contentSize.x;
        this.size.y = this.uitran.contentSize.y;

        this.halfx = this.size.x / 2;
        this.halfy = this.size.y / 2;

        this.set({ x: Math.random(), y: Math.random() });
    }

    set(value: type_x_y) {
        this.pos.x = this.size.x * value.x - this.halfx;
        this.pos.y = this.size.y * value.y - this.halfy;
        this.point.setPosition(this.pos);
    }

    onMove(event: EventTouch) {

        var delta = event.getUIDelta();
        var dx = delta.x;
        var dy = delta.y;

        this.pos.x += dx;
        this.pos.y += dy;

        this.pos.x += this.halfx;
        this.pos.y += this.halfy;
        this.pos.x %= this.size.x;
        this.pos.y %= this.size.y;

        this.px = this.pos.x / this.size.x;
        this.py = this.pos.y / this.size.y;

        this.px = this.px < 0 ? 1 + this.px : this.px;
        this.py = this.py < 0 ? 1 + this.py : this.py;

        this.pos.x -= this.halfx;
        this.pos.y -= this.halfy;
        this.point.setPosition(this.pos);
    }

    getPercent(): type_x_y {
        return { x: this.px, y: this.py }
    }
}

