import { _decorator, Component, Node, RigidBody, v3, Collider, Vec2, Vec3 } from 'cc';
import { fx_group } from '../effect/fx-group';
const { ccclass, property } = _decorator;

@ccclass('force_buoyance')
export class force_buoyance extends Component {

    @property
    p = 2;

    @property
    g = 9.81;

    @property
    sea_level = 0.5

    @property
    offset:Vec3 = v3(0, 0.5, 0);

    _rigid:RigidBody = null;

    _collider:Collider;

    _partical:fx_group = null;

    _center:Node = null;

    _delay = 2.0;

    __preload() {

        this._rigid = this.getComponent(RigidBody);

        this._collider = this.getComponent(Collider);

        this._partical = this.node.getChildByName('fx_move_patical')?.getComponent(fx_group);

        this._center = this.node.getChildByName('center');

    }

    onEnable() {
        this._rigid.clearForces();
        this._rigid.clearVelocity();
        this._rigid.clearState();
        this._rigid.useGravity = false;
        this._delay = 2.0;
    }

    update(deltaTime: number) {

        this._delay -= deltaTime;
        if (this._delay > 0) return;
        this._rigid.useGravity = true;

        if (this._center.worldPosition.y < 0.5) {
            // stop dirty
            if (this._partical && this._partical!._loop)
                this._partical!.setLoop(false);

            var depth = this.sea_level - this._center.worldPosition.y;
            
            var v = depth;
            if ( v > 1) v = 1;
            var force_up = v3(0, this.p * this.g * v * deltaTime);
            this._rigid.applyForce(force_up);

        }
        
    }
}

