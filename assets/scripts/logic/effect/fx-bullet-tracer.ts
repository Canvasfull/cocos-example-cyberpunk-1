import { _decorator, Component, error, Node, randomRange, Vec3 } from 'cc';
import { Res } from '../../core/res/res';
import { fun } from '../../core/util/fun';
const { ccclass, property } = _decorator;

@ccclass('FxBulletTracer')
export class FxBulletTracer extends Component {

    @property
    poolCount = 5;

    @property
    segment = 5;

    @property
    hiddenTime = 0.05;

    pool:Array<Node> | undefined;

    __preload() {
        this.node.on('init', this.init, this);
    }

    init() {

        this.pool = new Array(this.poolCount);
        const firstChild = this.node.children[0];
        this.pool[0] = firstChild;
        firstChild.active = false;

        for(let i = 1; i < this.poolCount; i++) {
            this.pool[i] = Res.instNode(firstChild, this.node);
        }

        this.node.on('setTracer', this.setTracer, this);
    }

    onDestroy() {
        this.node.off('init', this.init, this);
        this.node.off('setTracer', this.setTracer, this);
    }

    public setTracer(start:Vec3, end:Vec3) {

        const endPosition = end.clone();
        const direction = end.clone().subtract(start).normalize();
        const length = endPosition.subtract(start).length();

        const eachSegment = length/this.poolCount;
        const count = this.calculateSegment(length);
        const startPosition = start.clone();

        for(let i = 0; i < count; i++) {
            const currentLength = eachSegment;
            const currentNode = this.pool![i];
            currentNode.active = true;
            currentNode.setPosition(startPosition);
            currentNode.lookAt(end);
            currentNode.setScale(0.3, 1, randomRange(0.3, currentLength));
            startPosition.add(direction.clone().multiplyScalar(currentLength));
        }

        fun.delay(this.hiddenLines.bind(this), this.hiddenTime);

    }

    calculateSegment(length:number):number {
        let count = Math.round(length / this.segment);
        if(count > this.poolCount) count = this.poolCount;
        return count;
    }

    hiddenLines() {
        for(let i = 0; i < this.poolCount; i++) this.pool![i].active = false;
    }
}

