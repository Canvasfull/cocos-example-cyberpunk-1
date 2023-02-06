import { _decorator, Vec3, randomRangeInt, path, IVec3Like, math, v3, randomRange, Line, find } from 'cc';
import { KeyAnyType } from '../data/game-type';
const { ccclass, property, executeInEditMode } = _decorator;


export namespace NavSystem {

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
        console.log('init navigation data.', data);
    }

    export function nodePosition(nodeID:number) {
        return data.nodes[nodeID];
    }

    export function randomPoint(size = 0.5) {
        const randomNode = randomRangeInt(0, data.count);
        const node = data.nodes[randomNode];
        const radius = node.radius - size;
        const position = v3(node.x + randomRange(-radius, radius), node.y, node.z + randomRange(-radius, radius));
        return {closestNavigationPon:randomNode, position:position};

    }

    export function randomPaths(paths:Array<NavPointType>, position:Vec3, count:number, nearest:number = -1):NavPointType[] {

        paths.length = 0;

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

    export function randomFirePath(paths:Array<NavPointType>, node:number) {
        
        paths.length = 0;
        const length = randomRangeInt(5, 11);
        const nodeData = data.nodes[node];

        for(let i = 0; i < length; i++) {
            let point = v3(
                nodeData.x + randomRange(-nodeData.radius, nodeData.radius),
                nodeData.y,
                nodeData.z + randomRange(-nodeData.radius, nodeData.radius)
            )
            paths[i] = {x: point.x, y:point.y, z:point.z, id:nodeData.id, radius:nodeData.radius };

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

        if (index === -1) {
            throw new Error(`'can not find target node.`);
        }

        return index;

    }


    function findNearestPoint(position:Vec3):number {

        if(data == undefined) {
            console.warn(' Navigation data not init.');
            return 0;
        }

        return findNearest(position);

        /*

        let closestNavigationPon = -1;
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
                closestNavigationPon = nodeID;
            }
        } 

        return closestNavigationPon;
        */
    }

    function calculateRandomPaths(paths:Array<IVec3Like>, start:number, count:number) {

        if(data == undefined) {
            console.warn(' Navigation data not init.');
            return 0;
        }

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

    type PathPoint = {
        node: number,
        g:number,
        h:number,
        f:number,
        parent:PathPoint | undefined
    }
    

    export function findPaths(paths:Array<NavPointType>, start:Vec3, startNearest:number = -1, end:Vec3):NavPointType[] {

        paths.length = 0;

        // open table.
        let openTable: PathPoint[] = [];

        // close table.
        let closeTable: PathPoint[] = [];

        if(startNearest === -1) {
            // find nearest point.
            startNearest = findNearestPoint(start);
            openTable.push({ node:startNearest, g:0, h:0, f:0, parent: undefined });
        }

        // find nearest end point.
        const endNearest = findNearestPoint(end);
        //console.log('endNearest id', endNearest);

        // check start equal end.
        if(startNearest === endNearest) {
            paths.push(data.nodes[startNearest]);
            return paths;
        }

        const findMinCostPoint = function (): number {

            if(openTable.length <= 0) return -1;

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

        const checkInCloseTable = function (node:number) {
            for(let closeTableI = 0; closeTableI < closeTable.length; closeTableI++) {
                if(closeTable[closeTableI].node === node) return true;
            } 
            return false;
        }

        const pushOpenTable = function (node:number, parent:PathPoint) {

            const nodeData = data.nodes[node];

            // find target.
            if(nodeData.id == endNearest) {
                //console.log('find target.', nodeData.id, ' target id:', endNearest);
                return { node,  g:0, h:0, f:0, parent };
            }

            //console.log(start, nodeData);

            const g = Vec3.distance(start, nodeData);
            
            const h = Vec3.distance(nodeData, end);

            const f = g + h;

            //console.log('distances start:', distanceStart, 'distances target:', distanceTarget, 'f:', f);

            openTable.push({node, f, g, h, parent});
            
            return undefined
        }

        const searchNeighbor = function (parent:PathPoint) {

            const links = data.links[parent.node];

            //console.log('node:', node, 'neighbor links', links);

            for(let i = 0; i < links.length; i++) {

                const linkNode = links[i];
                // find in close table.
                // console.log('neighbor:', links[i], 'close table:', closeTable, 'state:', inCloseTable);
                if(checkInCloseTable(linkNode)) continue;

                // find in open table.
                if(checkInOpenTable(linkNode)) continue;

                // push in open table.
                const findPathPoint = pushOpenTable(linkNode, parent);
                if(findPathPoint) return findPathPoint;
            }

            return false;

        }

        const find = function () {

            // find min cost point.
            const minNodeIndex = findMinCostPoint();

            if(minNodeIndex == -1) {
                //console.log('can not find target.');
                return null;
            }

            //console.log('open table:', openTable, 'minNode:', minNode);

            // open table.
            const minNode = openTable[minNodeIndex];

            // remove open table.
            openTable.splice(minNodeIndex, 1);

            // insert close table.
            closeTable.push(minNode);

            // search neighbors.
            const findPathPoint = searchNeighbor(minNode);
            if(findPathPoint) {
                //console.log('find node target:', findPathPoint);
                return findPathPoint;
            }

            return undefined;

        }

        const calculateParent = function(targetNode:PathPoint) {

            const parent = targetNode.parent;
            if(parent == undefined) return;
            const node = data.nodes[parent.node];
            paths.push(node);
            calculateParent(parent);

        }

        let index = -1;
        let max = 112;
        let findTargetPoint:PathPoint | undefined | null;

        while(true) {
            index++;
            //console.log('index:', index, 'close table count:', closeTable.length, 'open table count:', openTable.length);
            if(index > max) break;
            findTargetPoint = find();
            if(findTargetPoint !== undefined) break;
        }

        //calculate paths
        if(findTargetPoint) {

            //console.log('find target point:', findTargetPoint);

            // push end node.
            paths.push(data.nodes[endNearest]);

            // get end to start list.
            calculateParent(findTargetPoint);

            paths.reverse();

        }

        return paths;
    }

}