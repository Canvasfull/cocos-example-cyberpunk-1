import { _decorator, Component, Node, Renderer, Line, v3, Vec2, Vec3, Graphics, gfx, debug, geometry, randomRangeInt, path } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('navigation_map')
@executeInEditMode
export class navigation_map extends Component {

    points:Vec3[] = [];

    __preload() {
        Navigation.init(this.node);
    }

    update(deltaTime: number) {

        if(EDITOR) {
            //this.updateEditModel();
        } 
    }

    updateEditModel() {
        console.log('navigation edit');
        this.linkChildNode(this.node);
    }

    linkChildNode(root:Node) {
        const children = root.children;
        
        for(var i = 0; i < children.length - 1; i++) {
            const p0 = children[i];
            const p1 = children[i + 1];
            const pos0 = p0.position;
            const pos1 = p1.position;
            //let line = new geometry.Line(pos0.x, pos0.y, pos0.z, pos1.x, pos1.y, pos1.z);
            //const l0 = p0.getComponent(Line);
            //l0.positions[0] = pos0 as never;
            //l0.positions[1] = pos1 as never;
        }
        
    }
}

export class Navigation {

    public static node:Node;

    public static init(_node:Node) {
       this.node = _node;
    }

    static calculateRandomPoint(curPos:Vec3) {

        // find closet point.
        var closet:Node = this.findChildren(this.node, curPos);

        if(closet === undefined) {
            console.error('closet not find', curPos, this.node);
            return [];
        }

        // random target node.
        const target:Node = this.randomChildren();

        // go target node.
        let paths:Vec3[] = [];
        paths.push(curPos);
        paths.push(closet.worldPosition);
        this.findTargetNode(paths, closet, target);

        return paths;

    }

    static findChildren(node:Node, curPos:Vec3) {
        let mindistance = Number.MAX_VALUE;
        const children = node.children;
        let minNode:Node = undefined;
        for(let i = 0; i < children.length; i++) {
            const cnode = children[i];
            if(node === cnode) continue;
            const wpos = children[i].worldPosition;
            const distance = Vec3.distance(curPos, wpos);
            if(distance < mindistance) {
                minNode = cnode;
                mindistance = distance;
            }
        }
        return minNode;
    }

    static randomChildren() {
        const randomIndex = randomRangeInt(0, this.node.children.length);
        return this.node.children[randomIndex];
    }

    static findTargetNode(paths:Vec3[], node:Node, target:Node) {

        const children = node.parent?.children;
        for(let i = 0; i < children.length; i++) {
            paths.push(children[i].worldPosition);
            if(children[i] == node) {
                break;
            }
        }

    } 

}