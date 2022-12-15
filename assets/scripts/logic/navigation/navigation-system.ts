import { _decorator, Vec3, randomRangeInt, path, IVec3Like, math, v3, randomRange } from 'cc';
import { KeyAnyType } from '../data/game-type';
const { ccclass, property, executeInEditMode } = _decorator;


export namespace NavPoints {

    export type NavPointType = {
        x:number,
        y:number,
        z:number,
        id:number,
        radius:number,
    }

    let data:KeyAnyType;

    export function Init(_data:any) {
        data = _data;
    }

    export function nodePosition(nodeID:number) {
        return data.nodes[nodeID];
    }

    export function randomPoint(size = 0.5) {
        const randomNode = randomRangeInt(0, data.count);
        const node = data.nodes[randomNode];
        const radius = node.radius - size;
        const position = v3(node.x + randomRange(-radius, radius), node.y, node.z + randomRange(-radius, radius));
        return {nearestNode:randomNode, position:position};

    }

    export function randomPaths(position:Vec3, count:number, nearest:number = -1):NavPointType[] {

        let paths = Array<NavPointType>(length);

        if(nearest === -1) {
            // find nearest point.
            nearest = findNearestPoint(position);
        }

        if (nearest === -1) {
            return [];
        }

        // search path.
        calculateRandomPaths(paths, nearest, count);

        return paths;

    }

    function findNearestPoint(position:Vec3):number {

        let nearestNode = -1;

        const x = Math.floor(position.x/data.blockX);
        const y = Math.floor(position.y/data.blockY);
        const z = Math.floor(position.z/data.blockZ);

        const key = `${x},${y},${z}`;
        const blockNodes = data.nodeMap[key];

        if(blockNodes === undefined) {
            console.warn(`Can not find block:${key}, position:${position}`)
            return -1;
        }

        let minDistance = Number.MAX_VALUE;
        //console.log(blockNodes);
        for (let i = 0; i < blockNodes.length; i++) {
            const nodeID = blockNodes[i]
            const nodePosition = data.nodes[nodeID];
            const currentDistance = Vec3.distance(position, nodePosition);
            if(currentDistance < minDistance) {
                nearestNode = nodeID;
            }
        } 

        return nearestNode;
    }

    function calculateRandomPaths(paths:Array<IVec3Like>, start:number, count:number) {

        paths[0] = data.nodes[start];
        //console.log('start node:', start, paths[0]);
        let currentNode = start;

        for (let i = 1; i < count; i++) {
            // random children.
            const links = data.links[currentNode];
            const randomLinkIndex = randomRangeInt(0, links.length);
            currentNode = links[randomLinkIndex]
            paths[i] = (data.nodes[currentNode]);
            //console.log('point_', currentNode, links, randomLinkIndex, paths[i]);
        }

    }
    

    export function findPaths(position:Vec3, nearest:number = -1):IVec3Like[] {

        let paths = Array<IVec3Like>(length);
        if(nearest === -1) {
            // find nearest point.
            nearest = findNearestPoint(position);

            if (nearest === -1) {
                throw new Error(`'can not find target node.`);
            }
        }

        // random node.
        const targetNode = randomRangeInt(0, data.count);

        // open table.
        let openTable = [];

        // close table.
        let closeTable = [];

        const f_cost = function (start:IVec3Like, end:IVec3Like) {
            return Math.abs(start.x - end.x) + Math.abs(start.z - end.z) + Math.abs(start.y - end.z);
        }

        const calculatePaths = function (node:number) {

        }

        return paths;
    }

}