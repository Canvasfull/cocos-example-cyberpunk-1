const CAPACITY:number = 10;


export class Stack<T> {

    private _elements: Array<T>;
    private _size:number;

    public constructor(capacity: number = CAPACITY) {
        this._elements = new Array<T>(capacity);
        this._size = 0;
    }

    public push(o:T) {
        var len = this._elements.length;
        if (this._size > len) {
            let temp = new Array<T>(len);
            this._elements = this._elements.concat(temp);
        }
        this._elements[this._size++] = o;
    }

    public cur() {
        return this._elements[this._size - 1];
    }

    public pop() {
        return this._elements[--this._size];
    }

    public peek() {
        return this._elements[this._size-1];
    }

    public size():number {
        return this._size;
    }

    public empty():boolean {
        return this._size === 0;
    }
    
    public clear(capacity:number = CAPACITY) {
        delete this._elements;
        this._elements = new Array(capacity);
        this._size = 0;
    }

}

export class Queue<T> {
    private _elements: Array<T>;
    private _size: number | undefined;

    public constructor(capacity?: number) {
        this._elements = new Array<T>();
        this._size = capacity;
    }

    public push(o:T) {
        if (o === null) {
            return false;
        }

        if (this._size !== undefined && !isNaN(this._size)) {
            if (this._elements.length === this._size) {
                this.pop();
            }
        }

        this._elements.unshift(o);
        return true;
    }

    public pop(): T {
        return this._elements.pop();
    }

    public size():number {
        return this._elements.length; 
    }
    
    public empty():boolean {
        return this.size() === 0;
    } 

    public clear() {
        delete this._elements;
        this._elements = new Array<T>(); 
    }
}