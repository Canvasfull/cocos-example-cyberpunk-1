import { _decorator, Collider, Component, ITriggerEvent, Node, PhysicsSystem, RigidBody, v3, Vec3 } from 'cc';
import { calculateDamageNode } from './damage-core';
import { Sound } from '../../core/audio/sound';
const { ccclass, property } = _decorator;

@ccclass('ProjectileGrenade')
export class ProjectileGrenade extends Component {

    _data:any;

    _size = v3(1, 1, 1);

    @property(Number)
    explodeTime = 3;

    @property(Vec3)
    endSize = v3(6, 6, 6);

    @property(Collider)
    collider:Collider | undefined;

    @property(RigidBody)
    rigidbody:RigidBody | undefined;

    updateFunction:Function | undefined;

    onThrow(weaponData:any, force:Vec3) {
        this._data = weaponData;
        this.rigidbody?.applyImpulse(force);
        this.updateFunction = this.waitExplode;
    }

    onExplode() {
        this.collider!.isTrigger = true;
        this.rigidbody!.useGravity = false;
        this.updateFunction = this.exploding;
        this.collider!.on('onTriggerEnter', this.onTriggerEnter, this);
        Sound.on(this._data.sound_explode);
    }

    onExplodeEnd() {
        this.updateFunction = undefined;
        this.collider!.off('onTriggerEnter', this.onTriggerEnter, this);
        this.node.active = false;
    }

    onTriggerEnter (event: ITriggerEvent) {
        const hitPoint = event.otherCollider.node.getWorldPosition();
        calculateDamageNode(this._data, event.otherCollider.node, hitPoint);
    }

    waitExplode(deltaTime:number) {
        this.explodeTime -= deltaTime;
        if(this.explodeTime <= 0) {
            this.onExplode();
        }
    }

    exploding(deltaTime:number) {
        Vec3.lerp(this._size, this._size, this.endSize, deltaTime * 5);
        this.node.setWorldScale(this._size);
        if(Math.abs(this._size.x - this.endSize.x) < 0.1) {
            this.onExplodeEnd();
        }
    }

    update(deltaTime:number) {
        if(this.updateFunction !== undefined)
            this.updateFunction(deltaTime);
    }

}

