/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { Res } from '../../core/res/res';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('GunTracerPool')
export class GunTracerPool extends Component {

    // The depth of the object pool. 
    @property( {type: Number, tooltip: 'The depth of the object pool.' })
    poolCount = 20;

    // A collection of arrays that store object pools.
    pool:Array<Node> | undefined;

    // The usage index of the object pool.
    index = 0;

    start() {

        // Create an array of objects based on the object pool depth.
        this.pool = new Array(this.poolCount);

        // Get the base object of the object pool.
        const poolItem = this.node.children[0];

        // Set the base object as the first element of the object pool.
        this.pool[0] = poolItem;

        // Starting from one, generate an object pool in a loop.
        for(var i = 1; i < this.poolCount; i++) {
            // Instantiates a new object from the base object. And map to the current object pool index object.
            this.pool[i] = Res.instNode(poolItem, this.node);
            // Initialize this newly generated object.
            this.pool[i].emit('init');
        }

        // Initialize the base object.
        poolItem.emit('init');

        // Register an external access message executor
        Msg.on('msg_set_tracer', this.setTracer.bind(this));

    }

    /**
     * Set start and end positions
     * @param data set data.
     */
    setTracer(data:{start:Vec3, end:Vec3}) {

        // Get a ray from the object pool.
        this.pool![this.index].emit('setTracer', data.start, data.end);

        // The object pool index add one.
        this.index++;

        // If the index exceeds the maximum length, set the index to start from 0.
        if(this.index >= this.poolCount) this.index = 0;

    }


}

