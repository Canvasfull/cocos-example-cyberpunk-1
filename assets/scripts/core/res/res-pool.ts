import { _decorator, Component, Node, Prefab, Pool } from 'cc';
import { Msg } from '../msg/msg';
import { Singleton } from '../pattern/singleton';
import { Res } from './res';
import { ResCache } from './res-cache';
const { ccclass, property } = _decorator;

@ccclass('ResPool')
export class ResPool extends Singleton {

    _root:Node = null;

    _pool = new Map<string, pool>();

    public init() {
    }

    public initPool(root:Node) {
        this._root = root;
        Msg.on('pool_recycle', this.pool_recycle.bind(this));
    }

    pool_recycle() {
        this._pool.forEach(element => {
            element.recycle();
        });
    }

    public pop(name:string)  {
        if (!this._pool.has(name)) {
            this.newPool(name);
        }
        return this._pool.get(name).pop();
    }

    public push(obj:Node) {
        console.log(obj.name);
        this._pool.get(obj.name).push(obj);
    }

    public pushByName(name:string, obj:Node) {
        console.log(name, obj);
        this._pool.get(name).push(obj);
    }

    public newPool(name:string) {
        var newpool = new pool(name, this._root);
        this._pool.set(name, newpool);
    }

}

export class pool {

    _index:number = 0;

    _items:Node[] = [];

    _state:number[] = [];

    _max:number = 0;

    _realMax:number = 0;

    _name:string = '';

    _prefab:Prefab = null;

    _root:Node = null;

    public constructor(name:string, root:Node) {
        this.IncreaseSize();
        this._name = name;
        this._prefab = ResCache.Instance.getPrefab(this._name);
        this._root = root;
    }

    recycle() {

        for(let i = 0; i < this._max; i++) {
            this._state[i] = 1;
            this._items[i].active = false;
            this._items[i].setPosition(10000, 10000, 10000);
        }
    }

    public pop():Node {
        
        for(let i = 0; i < this._max; i++) {
            var state = this._state[this._index];
            if (state === 1) {
                var n = this._items[this._index];
                this._state[this._index] = 2;
                n.active = true;
                this.next();
                return n;
            }
            this.next();
        }

        // Not find res.
        // Create new one.
        return this.newRes();
        
    }

    public next() {
        this._index++;
        if (this._index >= this._max) this._index = 0;
    }

    public push(obj:Node) {
        
        obj.active = false;
        var poolindex = obj['pool_index'];
        this._state[poolindex] = 1;
    }

    public newRes() {        

        // Check & Increase pool size
        this.checkAndIncreaseSize();

        // Inst new node.
        const newNode = Res.inst(this._prefab, this._root);
        this._index = this._max;
        this._max++;
        if (newNode['pool_index'] !== undefined) {
            console.log('pool create error.');
        }
        newNode['pool_index'] = this._index;
        this._items[this._index] = newNode;
        this._state[this._index] = 2;
        return newnode;

    }

    public checkAndIncreaseSize() {

        // Check the size is full.
        // Judge last items is not null.
        var last = this._items.length - 1;
        if (this._items[last] === null)
            return;

        // Increase size.
        this.IncreaseSize();
    }

    public IncreaseSize() {
        this._realMax += 8;
        this._items.push(null, null, null, null, null, null, null, null);
        this._state.push(0, 0, 0, 0, 0, 0, 0, 0)
    }

}

