import { _decorator, Vec3, randomRangeInt, path, IVec3Like, math, v3, randomRange, Line, find } from 'cc';
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

    export function randomFirePath(node:number) {
        
        const length = randomRangeInt(5, 11);

        let paths = Array<Vec3>(length);

        const nodeData = data.nodes[node];

        for(let i = 0; i < length; i++) {
            let point = v3(
                nodeData.x + randomRange(-nodeData.radius, nodeData.radius),
                nodeData.y,
                nodeData.z + randomRange(-nodeData.radius, nodeData.radius)
            )
            paths[i] = point;
        }

        return paths;

    }

    export function findNearest(position:Vec3):number {

        const length = data.nodes.length;
        let minlength = Number.MAX_VALUE;
        let index = -1;
        for(let i = 0; i < length; i++) {
            const node = data.nodes[i];
            const curLen = Vec3.distance(position, node);
            if(curLen < minlength) {
                index = i;
                minlength = curLen;
            }
        }

        return index;

    }


    function findNearestPoint(position:Vec3):number {

        return findNearest(position);

        /*

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
        */
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
    

    export function findPaths(start:Vec3, nearest:number = -1, target:Vec3):NavPointType[] {

        let paths = Array<NavPointType>(length);

        // open table.
        let openTable: any[] = [];

        // close table.
        let closeTable: number[] = [];

        if(nearest === -1) {
            // find nearest point.
            nearest = findNearestPoint(start);

            openTable.push({ node:nearest, f:0 });

            if (nearest === -1) {
                throw new Error(`'can not find target node.`);
            }
        }

        const findMinCostPoint = function (): number {
            let cost = Number.MAX_VALUE;
            let minNode = -1;
            for(let i = 0; i < openTable.length; i++) {
                const current = openTable[i];
                if(current.f < cost) {
                    minNode = i;
                    cost = current.f;
                }
            }
            return minNode;
        }

        const checkInOpenTable = function (node:number) {
            for(let openTableI = 0; openTableI < openTable.length; openTableI++) {
                if(openTable[openTableI].node === node) return true;
            } 
            return false;
        }

        const pushOpenTable = function (node:number) {

            const nodeData = data[node];

            const distanceStart = Vec3.distance(start, nodeData);
            
            const distanceTarget = Vec3.distance(nodeData, target);

            const f = distanceStart + distanceTarget;

            console.log(distanceStart, distanceTarget, f);

            openTable.push({node, f, distanceStart, distanceTarget});

            // find target.
            if(distanceTarget < 5) return true;
            
            return false;
        }

        const searchNeighbor = function (node:number) {

            const links = data.links[node];

            for(let i = 0; i < links.length; i++) {

                // find in close table.
                if(closeTable.indexOf(links[i]) > 1) continue;

                // find in open table.
                if(checkInOpenTable(node)) continue;

                // push in open table.
                if(pushOpenTable(node)) {
                    
                }

            }

        }

        const calculatePaths = function (node:number) {

            // find min cost point.
            const minNode = findMinCostPoint();

            // insert closeTable.
            closeTable.push(minNode);

            // search neighbors
            searchNeighbor(minNode);

        }

        return paths;
    }

}