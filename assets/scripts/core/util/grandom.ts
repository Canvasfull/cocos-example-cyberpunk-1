import { _decorator, Component, Node, random, randomRangeInt } from 'cc';
const { ccclass, property } = _decorator;

/*
 *  Xn+1 =( A * Xn + C ) mod M
 */
@ccclass('grandom')
export class grandom {

    prand: number = 0;
    seed: number = 0;
    c = 49297;
    a = 9301;
    m = 233280;//0x07ffff;

    constructor (seed: number = -1) {
        this.seed = seed;
        if (this.seed == -1) this.seed = randomRangeInt(0, 0xffffffff);
        this.prand = this.seed;
    }

    reset () {
        this.prand = this.seed;
    }

    value () {
        this.prand = (this.a * this.prand + this.c) % this.m;
        return this.prand
    }

    get value1000 () {
        return this.range(0, 1000);
    }

    range (min: number, max: number): number {
        var v = min + (this.value() % (max - min + 1))
        return v;
    }

    range1000 (min: number, max: number) {
        var ret = this.range(min * 1000, max * 1000);
        return Math.floor(ret / 1000);
    }
}

