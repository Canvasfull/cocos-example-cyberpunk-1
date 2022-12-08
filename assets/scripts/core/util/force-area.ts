import { _decorator, Component, Node, Vec3, Collider, ITriggerEvent, v3, math, game } from 'cc';
import { Game } from '../data/game';
import { u3 } from './util';
const { ccclass, property } = _decorator;

@ccclass('ForceArea')
export class ForceArea extends Component {

    @property(Vec3)
    force: Vec3 = v3(0, 0, 0);

    @property
    posScale: Vec3 = v3(0, 4, 0);

    _force: Vec3 = v3(0, 0, 0);

    _collider: Collider;

    __preload () {

        this._collider = this.getComponent(Collider);
        this._collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this._collider.on('onTriggerStay', this.onTriggerStay, this);

    }

    onEnable() {
        var area_force = Game.Instance._cur_name === 'level';
        this._collider.enabled = area_force;
    }

    forceRate (other: Node): Vec3 {
        u3.c(this._force, this.force);
        if (this.posScale.x !== 0) this._force.x = this.calculate(other.worldPosition.x - this.node.worldPosition.x, this.posScale.x, this.force.x);
        if (this.posScale.y !== 0) this._force.y = this.calculate(other.worldPosition.y - this.node.worldPosition.y, this.posScale.y, this.force.y);
        if (this.posScale.z !== 0) this._force.z = this.calculate(other.worldPosition.z - this.node.worldPosition.z, this.posScale.z, this.force.z);

        //if (this._force.x < 0) this._force.x = 0;
        //if (this._force.y < 0) this._force.y = 0;
        //if (this._force.z < 0) this._force.z = 0;

        //this._force.multiply(this.force);

        
        return this._force.clone();
    }

    calculate (value: number, max: number, scale: number): number {
        var a = value / max;
        a = Math.log(a) * 2 + max;
        if (a < 0) a = 0;
        a = (max - a) / max + 11;
        
        return a;
    }

    onTriggerEnter (event: ITriggerEvent) {
        event.otherCollider.node.emit('addAreaForce', this.forceRate(event.otherCollider.node));
    }

    onTriggerStay (event: ITriggerEvent) {
        event.otherCollider.node.emit('addAreaForce', this.forceRate(event.otherCollider.node));
    }

}

