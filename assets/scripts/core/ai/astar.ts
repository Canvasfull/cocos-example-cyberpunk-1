import { instantiate, math, Node } from "cc";
import { Singleton } from "../pattern/singleton";
import { Stack } from "../util/data-structure";


export class AStar extends Singleton {

    map:any[];
    start_pos;
    end_pos;

    closeTable = [];
    openTable:Stack<any[]>;

    max_x = 0;
    max_z = 0;

    dir = [
        [-1, 1], [0, 1], [1, 0],
        [-1, 0],         [1, 0],
        [-1, -1], [0, -1], [1, -1]
    ]

    _tempNode:Node;

    _stop = true;

    public initMap(_map:[][]) {

        this.map = [];
        this.max_x = _map.length;
        this.max_z = _map[0].length;

        // init map
        for(let i = 0; i < this.max_x; i++) {
            let m = [];
            for(let j = 0; j < this.max_z; j++) {
                var v = {'f':-1, 'state': _map[i][j]};
                m.push(v);
            }
            this.map.push(m);
        }

        console.log(this.map);

        this.openTable = new Stack(20);
        this.closeTable = this.createTable(this.max_x, this.max_z, 0);
        this.copyTable(this.closeTable, this.map);
    }

    setTestNode(node) {
        this._tempNode = node;
    }

    testNode(pos) {
        let inst = instantiate(this._tempNode);
        inst.parent = this._tempNode.parent;
        inst.setPosition(pos[0],0,pos[1]);
    }

    find(start_pos, end_pos) {

        console.log('start:', start_pos, 'end:', end_pos);
        this._stop = false;
        this.start_pos = start_pos;
        this.end_pos = end_pos;
        // Set start pos into open table.
        this.openTable.push([start_pos.x, start_pos.z]);
        this.checkCurrent(start_pos);
    }

    update() {

        if (this._stop) return;

        if (this.openTable.size() > 0) {
            var np = this.openTable.pop();
            this.testNode(np);
            this.checkCurrent({'x': np[0], 'z': np[1] });
        }else{
            console.log('can not find target pos.');
        }
    }

    checkCurrent(pos) {

        

        // Check is end pos.
        if (pos.x === this.end_pos.x && pos.z === this.end_pos.z) {
            console.log('find end pos.');
            this._stop = true;
            return;
        }

        // Set remove state in open table.
        this.map[pos.x][pos.z].state = 0;
        this.openTable.pop();

        // Set current pos in close table.
        this.closeTable[pos.x][pos.z] = 1;

        var min_index = -1;
        // Calculate around
        for(let i = 0; i < this.dir.length; i++) {

            var nx = pos.x + this.dir[i][0];
            var nz = pos.z + this.dir[i][1];

            // Check bounder.
            if (nx < 0 || nz < 0 || nx >= this.max_x || nz >= this.max_z) {
                continue;
            }

            // Check is not close table.
            if (this.closeTable[nx][nz] === 1) continue;

            // Check is dir cost.
            var f = this.f_cost({'x': nx, 'z': nz}, this.end_pos);
            this.map[nx][nz].cost = f;

            // Push new check point into open table.
            this.openTable.push([nx, nz]);

        }

    }

    public f_cost(cur_pos, end_pos) {
        return Math.abs(cur_pos.x - end_pos.x) + Math.abs(cur_pos.z - end_pos.z)
    }

    createTable(x:number, y:number, value) {
        var l0 = x;
        var l1 = y;
        var table = [];
        for(let i = 0; i < l0; i++) {
            var m = [];
            for(let j = 0; j < l1; j++) {
                m.push(value);
            }
            table.push(m);
        }
        return table;
    }

    copyTable(target, source) {
        var l0 = this.max_x;
        var l1 = this.max_z;
        for(let i = 0; i < l0; i++) {
            for(let j = 0; j < l1; j++) {
                target[i][j] = source[i][j];
            }
        }
    }

    clearTable(table) {
        var l0 = table.length;
        var l1 = table[0].length;
        for(let i = 0; i < l0; i++) {
            for(let j = 0; j < l1; j++) {
                table[i][j] = 0;
            }
        }
    }

    
 
}

/*

    findMinCostPoint(cur_pos) {

        var min_cost_pos = { 'x': -1, 'z': -1 };

        // Calculate f_cost
        for(let i = 0; i < this.dir.length; i++) {
            var nx = cur_pos.x + this.dir[i][0];
            var nz = cur_pos.z + this.dir[i][1];

            // Check bounder.
            if (nx < 0 || nz < 0 || nx >= this.max_x || nz >= this.max_z) {
                continue;
            }

            // Check is not close table.
            if (this.closeTable[nx][nz] === 1) continue;

            // Check is 

        }

        if (min_cost_pos.x === -1) {
            console.error(' can not find min cost pos:', cur_pos);
        }

        //for()

    }

*/