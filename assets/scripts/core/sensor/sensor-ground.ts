import { _decorator, Component, Collider, ICollisionEvent, geometry, Node, PhysicsSystem, Vec3, v3, Color, RigidBody } from 'cc';
import { Actor } from '../../logic/actor/actor';
import { SubstanceCore } from '../../logic/item/substance-core';
import { Gizmo, UtilVec3 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('SensorGround')
export class SensorGround extends Component {

    _collider: Collider | undefined | null;
    _actor: Actor | undefined | null;
    _isGround = false;
    _ray: geometry.Ray = new geometry.Ray();
    _velocity:Vec3 = v3(0, 0, 0);

    _rigid:RigidBody | undefined;

    @property(Number)
    checkDistance = 0.2;

    @property([Vec3])
    original = []

    @property([Number])
    masks = [];

    _mask = 0

    pos = v3(0, 0, 0);

    start () {

        this._collider = this.getComponent(Collider);
        this._ray.d.x = 0;
        this._ray.d.y = -1;
        this._ray.d.z = 0;
        this._actor = this.node.getComponent(Actor);

        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];
    }

    update (deltaTime: number) {
        this.checkGroundRays();
    }

    checkGroundRays() {

        for(let i = 0; i < this.original.length; i++) {
            UtilVec3.copy(this._ray.o, this.node.worldPosition);
            this._ray.o.add(this.original[i]);
            if (PhysicsSystem.instance.raycastClosest(this._ray, this._mask, this.checkDistance)) {
                const res = PhysicsSystem.instance.raycastClosestResult;
                //this._actor!._data.walk_in_type = SubstanceCore.Instance.checkNodeType(res.collider.node);
                if(!this._isGround) this._actor?.onGround();
                this._isGround = true;
                return;
            }
        }

        if(this._isGround) this._actor?.offGround();
        this._isGround = false;

    }

}