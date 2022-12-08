import { _decorator, Node, Vec3, Vec2, Color, MeshRenderer, randomRangeInt, tween, Tween, v3, director, Sprite, Component } from 'cc';
import { ComponentType, ComponentTypes, Constructor } from '../data/game-type';
import { Log } from '../io/log';
import { GRandom } from './grandom';
const { ccclass, property } = _decorator;

export class Util {

    public static deltaLimit (value: number, delta: number, speed: number, min: number, max: number): number {

        value += delta * speed;
        if (value < min) value = min;
        if (value > max) value = max;
        return value;

    }


    public static calculateMaxBounders (renders: MeshRenderer[]) {

        var max_x = 0;
        var max_y = 0;
        var max = 0;

        for (let i = 0; i < renders.length; i++) {
            if (!renders[i].node.active) continue;
            let x = renders[i].model!.worldBounds.halfExtents.x * renders[i].node.scale.x;
            if (x > max_x) {
                max_x = x;
            }

            let y = renders[i].model!.worldBounds.halfExtents.y * renders[i].node.scale.y;
            if (y > max_y) {
                max_y = y;
            }
        }

        max = max_x > max_y ? max_x : max_y;

        return { x: max_x, y: max_y, max: max };
    }

}

export class UtilStr {

    public static equal (str: string, items: string[]): boolean {
        const count = items.length;
        for (var i = 0; i < count; i++) {
            var t = items[i]
            if (str === t) {
                return true;
            }
        }
        return false;
    }

    public static include (str: string, items: string[]): boolean {
        const count = items.length;
        for (var i = 0; i < count; i++) {
            const t = items[i];
            if (str.includes(t)) {
                return true;
            }
        }
        return false;
    }

    public static selectFromItems (items: string[], len: number = -1): string {
        var count = len === -1 ? items.length : len;
        var idx = randomRangeInt(0, count);
        return items[idx];
    }

}

export class UtilMaterial {

    public static setColor (node: Node, color: Color) {
        const meshRender = node.getComponent(MeshRenderer);
        meshRender?.material?.setProperty('mainColor', color);
    }

}

export class u3 {

    public static deltaLimit (vec: Vec3, delta: Vec3, speed: number, min: Vec3, max: Vec3) {

        vec.x = Util.deltaLimit(vec.x, delta.x, speed, min.x, max.y);
        vec.y = Util.deltaLimit(vec.y, delta.y, speed, min.y, max.y);
        vec.z = Util.deltaLimit(vec.z, delta.z, speed, min.z, max.z);

    }

    public static c (a: Vec3, b: Vec3) {
        a.x = b.x;
        a.y = b.y;
        a.z = b.z;
    }

    public static c2 (a: Vec3, b: Vec2) {
        a.x = b.x;
        a.y = b.y;
    }

}

export class u2 {

    public static deltaLimit (vec: Vec2, delta: Vec2, speed: number, min: Vec2, max: Vec2) {

        vec.x = Util.deltaLimit(vec.x, delta.x, speed, min.x, max.y);
        vec.y = Util.deltaLimit(vec.y, delta.y, speed, min.y, max.y);

    }

    public static c (a: Vec2, b: Vec2) {
        a.x = b.x;
        a.y = b.y;
    }

    public static c3 (a: Vec2, b: Vec3) {
        a.x = b.x;
        a.y = b.y;
    }
}

export class UtilArray {

    public static remove<T> (array: T[], key: T): void {
        const index = array.indexOf(key, 0);
        if (index !== -1) {
            array.splice(index, 0);
        }
    }

    public static init (len: number, value: number = 0) {
        var a = [];
        for (var i = 0; i < len; i++)
            a.push(value);
        return a;
    }

    public static init_3 (a0: number, a1: number, a2: number): number[][][] {
        var array = [];
        for (var i = 0; i < a0; i++) {
            var ai = [];
            for (var j = 0; j < a1; j++) {
                var aj = [];
                for (var k = 0; k < a2; k++) {
                    aj.push(0);
                }
                ai.push(aj);
            }
            array.push(ai);
        }
        return array;
    }

    public static reset_3 (a: number[][][], value: number = 0) {
        const a0 = a.length;
        const a1 = a[0].length;
        const a2 = a[0][0].length;
        for (var i = 0; i < a0; i++) {
            for (var j = 0; j < a1; j++) {
                for (var k = 0; k < a2; k++) {
                    a[i][j][k] = value;
                }
            }
        }
    }

    public static addArray (a: number[], b: number[]) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    }

}

export class UtilNode {

    public static getChildByName(node:Node, name:string): Node {
        const child = node.getChildByName(name);
        if (child === null) throw new Error(`${node.name} node children not find '${name}'`);
        return child;
    }

    public static getComponent<T extends Component>(node:Node, type:{ new () : T }): T{
        const component = node.getComponent(type) as T;
        if(component === null) throw new Error(`${node.name} node not find '${name}'`);
        return component;
    }

    public static getChildComponent<T extends Component>(node:Node, name:string, type:{ new () : T }): T  {
        const child = this.getChildByName(node, name);
        return this.getComponent(child, type);
    }

    public static getChildren (node: Node): Node[] {
        let ls: Node[] = [];
        var find = (node: Node) => {
            ls.push(node);
            node.children.forEach(element => {
                if (element.children) {
                    find(element);
                }
            });
        }
        find(node);
        return ls;
    }

    public static find (node: Node, name: string): Node {

        let n: Node = Object.create(null);
        var find = (node: Node, name: string) => {
            if (node.name === name) {
                n = node
                return;
            }
            node.children.forEach(element => {
                if (element.children) {
                    find(element, name);
                }
            });
        }
        find(node, name);
        return n;

    }

    public static getChildrenByNameBlur (node: Node, blurName:string): {[key:string]:Node} {
        let map: {[key:string]:Node} = {};
        var find = (node: Node) => {
            if (node.name.concat(blurName)) {
                map[node.name] = node; 
            }
            map[node.name] = node;
            node.children.forEach(element => {
                if (element.children) {
                    find(element);
                }
            });
        }
        find(node); 

        return map;
    }

}

export class UtilLog {
    public static children (node: Node) {
        var info = `${node.name}:${node.children.length}:`;
        node.children.forEach(n => {
            info += `${n.name},`;
        });
        console.log(info);
    }
}


export function waitFor (duration: number) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, duration * 1000.0);
    });
}


export class UtilCurve {

    public static Bezier (points: number[], t: number) {

        let len = points.length / 3;

    }

    public static ParaCurve (s: number, x: number, y: number, z: number, vx: number, vy: number, vz: number, g: number, segment: number) {

        var points: number[] = [];

        // Calculate total time.
        var totalTime = Math.sqrt(2 * s / g);
        var cell_time = totalTime / segment;

        // x = vx * t
        // z = vz * t
        // y = 1/2 * g * t * t.
        // g = 0.98.
        var cur_time = 0;
        for (var i = 0; i <= segment; i++) {
            var xi = vx * cur_time + x;
            var zi = vz * cur_time + z;
            var yi = vy * cur_time - 1 / 2 * g * cur_time * cur_time + y;
            points.push(xi);
            points.push(yi);
            points.push(zi);
            cur_time += cell_time;
        }
        return points;
    }

    public static ParaCurveByDir (s: number, x: number, y: number, z: number, vx: number, vy: number, vz: number, g: number, dx: number, dy: number, dz: number, segment: number) {

        var points: number[] = [];

        // Calculate total time.
        var totalTime = Math.sqrt(2 * s / g);
        var cell_time = totalTime / segment;

        // x = vx * t
        // z = vz * t
        // y = 1/2 * g * t * t.
        // g = 0.98.
        var cur_time = 0;
        for (var i = 0; i <= segment; i++) {
            var xi = vx * cur_time + x;
            var zi = vz * cur_time + z;
            var yi = vy * cur_time - 1 / 2 * g * cur_time * cur_time + y;
            points.push(xi * dx);
            points.push(yi * dy);
            points.push(zi * dz);
            cur_time += cell_time;
        }
        return points;
    }

}

export class UtilRandom {

    public static pos (rand: GRandom, min: Vec3, max: Vec3, f: number = 1000): Vec3 {
        var pos = v3(0, 0, 0);
        pos.x = rand.range(min.x, max.x) / f;
        pos.y = rand.range(min.y, max.y) / f;
        pos.z = rand.range(min.z, max.z) / f;
        return pos;
    }

    public static angle (rand: GRandom, min: Vec3, max: Vec3): Vec3 {
        var angle = v3(0, 0, 0);
        angle.x = rand.range(min.x, max.x);
        angle.y = rand.range(min.y, max.y);
        angle.z = rand.range(min.z, max.z);
        return angle;
    }

    public static scale (rand: GRandom, min: Vec3, max: Vec3, f: number = 1000): Vec3 {
        var scale = v3(0, 0, 0);
        scale.x = rand.range(min.x, max.x) / f;
        scale.y = rand.range(min.y, max.y) / f;
        scale.z = rand.range(min.z, max.z) / f;
        return scale;
    }

}

export class UtilGeometry {

    public static drawLine (p0: Vec3, p1: Vec3, color: Color = Color.GREEN) {
        let geometryRenderer = director.root?.pipeline.geometryRenderer;
        geometryRenderer?.addLine(p0, p1, color, undefined);
    }

}

export class UtilTime {

    public static toHours(seconds:number):number {
        return Math.ceil(seconds / 3600);
    }

    public static yearMonth():string {

        var date = new Date();

        var y = date.getFullYear().toString();

        var m = date.getMonth().toString();
        if (m.length < 2) m = `0${m}`;

        var d = date.getDate().toString();
        if (d.length < 2) d = `0${d}`;

        var h = date.getHours().toString();

        return`${y}.${m}.${d}:${h}`;

    }

    public static timeStamp() {

        return  Date.parse(new Date().toString());

    }

}