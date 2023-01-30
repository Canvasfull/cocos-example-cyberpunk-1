import { _decorator, Component, Node, v3, Color, geometry, Vec3, PhysicsSystem, math, JsonAsset, IVec3Like, Input, input, EventKeyboard, KeyCode, color } from 'cc';
import { EDITOR } from 'cc/env';
import { JsonTool } from '../../core/io/json-tool';
import { Gizmo, UtilVec3 } from '../../core/util/util';
import { NavigationPoint } from './navigation-point';
import { NavPoints } from './navigation-system';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('NavigationRegion')
@executeInEditMode
export class NavigationRegion extends Component {

    @property
    maxDistance = 15;

    @property
    height = 0.5;

    @property
    maxHeight = 3;

    @property
    slopHeight = 1;

    @property
    slopDistance = 7;

    @property
    mapBlockX = 15;

    @property
    mapBlockY = 3;

    @property
    mapBlockZ = 15;

    @property
    testPath = false;

    @property(Node)
    testNode:Node | undefined;

    findPaths:IVec3Like[] = [];

    onEnable() {
        if(EDITOR) {
            this.refreshMapPoints();
            /*
            input.on(Input.EventType.KEY_DOWN, (event:EventKeyboard)=>{
                if(event.keyCode === KeyCode.KEY_P){
                    this.refreshMapPoints();
                    console.log('refresh map points.');
                } 
            }, this)
            */
        }
    }

    refreshMapPoints() {
        const children = this.node.children;
        let data = {
            blockX: this.mapBlockX,
            blockY: this.mapBlockY,
            blockZ: this.mapBlockZ,
            count:children.length,
            nodeMap:{},
            nodes:[],
            links:[], 
            weights:[]
        };
        for(let i = 0; i < children.length; i++) {
            const child = children[i];
            child.name = `point_${i}`;
            const navigationPoint = child.getComponent(NavigationPoint);
            if(!navigationPoint) {
                child.addComponent(NavigationPoint);
            }
            const worldPosition = child.worldPosition;
            const pos = {
                x:Number(worldPosition.x.toFixed(3)), 
                y:Number(worldPosition.y.toFixed(3)), 
                z:Number(worldPosition.z.toFixed(3)),
                id:child.getSiblingIndex(),
                radius:navigationPoint?.radius,
            };
            const keyX = Math.floor(pos.x / this.mapBlockX);
            const keyY = Math.floor(pos.y / this.mapBlockY);
            const keyZ = Math.floor(pos.z / this.mapBlockZ);
            const key = `${keyX},${keyY},${keyZ}`;
            if(data.nodeMap[key] === undefined) data.nodeMap[key] = [];
            data.nodeMap[key].push(child.getSiblingIndex());
            data.nodes.push(pos);
            const linkInfo = this.calculateCircleLink(child);
            data.links.push(linkInfo.links);
            data.weights.push(linkInfo.weights);
        }
        console.log(JsonTool.toJson(data));

        if(this.testPath) {

            NavPoints.Init(data);

            // Test Random paths.
            //this.testRandomPath();

            // Test Find paths.
            this.testFindPath();

        }
    }

    calculateCircleLink(node:Node):{ links:number[], weights:number[]} {
        const children = this.node.children;
        const origin = node.worldPosition;
        const ray = new geometry.Ray();
        ray.o = node.worldPosition;
        const position = v3(0, 0, 0);
        let link:Node[] = [];
        let weights:number[] = [];
        let linkIndex:number[] = [];
        for(let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child === node) continue;
            UtilVec3.copy(position, child.worldPosition);
            ray.d = position.subtract(origin).normalize();
            const distance = Vec3.distance(origin, child.worldPosition);
            if (distance > this.maxDistance) continue;
            const heightDifference = Math.abs(origin.y - child.worldPosition.y);
            if (heightDifference > this.maxHeight) continue;
            if (heightDifference > this.slopHeight && distance > this.slopDistance) continue;
            if (!PhysicsSystem.instance.raycastClosest(ray, undefined, distance)){
                link.push(child);
                linkIndex.push(child.getSiblingIndex());
                weights.push(Number(distance.toFixed(3)));
            }
        }
        const navigationPoint = node.getComponent(NavigationPoint);
        navigationPoint!.linkNodes = link;
        navigationPoint!.weights = weights;
        return { links:linkIndex, weights:weights }
    }

    update(deltaTime:number) {

        if(EDITOR) {
            this.testFindPaths();
        }

    }

    testFindPaths() {

        if(this.findPaths.length <= 0) return;

        let p0 = v3(0, 0, 0);
        let p1 = v3(0, 0, 0);

        //Gizmo.drawBox(p0, v3(10, 1, 10), Color.YELLOW);
        Gizmo.drawBox(this.findPaths![0] as Vec3, Vec3.ONE, Color.WHITE);

        for (let i = 1; i < this.findPaths.length; i++) {
            const start = this.findPaths![i - 1] as Vec3;
            const end = this.findPaths![i] as Vec3;
            UtilVec3.copy(p0, start);
            UtilVec3.copy(p1, end);
            p0.y += 0.1;
            p1.y += 0.1;

            const isLast = i === (this.findPaths.length - 1);
            if(isLast) {
                Gizmo.drawBox(p1, Vec3.ONE, Color.RED);
            }else{
                Gizmo.drawCircle(p1, 1, Color.RED);
            } 
            Gizmo.drawLine(p0, p1, Color.RED);
        }
    }

    testRandomPath() {
        // random point.
        const point = NavPoints.randomPoint();
        this.testNode?.setWorldPosition(point.position);
        this.findPaths = NavPoints.randomPaths(this.testNode!.worldPosition, 20, point.nearestNode);
    }

    testFindPath() {
    
        // random start.
        const start = NavPoints.randomPoint();

        // random end.
        const end = NavPoints.randomPoint();

        //this.findPaths = [];
        //this.findPaths.push(start.position);
        //this.findPaths.push(end.position);

        this.findPaths = NavPoints.findPaths(start.position, -1, end.position);

        console.log('find paths:', this.findPaths);
    }
}

