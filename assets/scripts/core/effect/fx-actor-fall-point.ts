import { _decorator, Component, Node, geometry, PhysicsSystem, v3, Line, Vec3, Graphics, ParticleSystem, CurveRange } from 'cc';
import { UtilVec3 } from '../util/util';
const { ccclass, property } = _decorator;

@ccclass('FxActorFallPoint')
export class FxActorFallPoint extends Component {

    _ray: geometry.Ray = new geometry.Ray();
    _height = 0;
    _line: Node;
    _fxHit: Node;
    _hitPos: Vec3;

    @property(ParticleSystem)
    particle_high_light:ParticleSystem = null

    @property
    rate_high_light = 1.0;

    start () {
        this._line = this.node.getChildByName('line');
        this._fxHit = this.node.getChildByName('hitpoint');
        this._hitPos = v3(0, 0, 0);
        this._ray.d.x = 0;
        this._ray.d.y = -1;
        this._ray.d.z = 0;
    }

    update (deltaTime: number) {
        this.detectPoint();
    }

    detectPoint () {
        UtilVec3.copy(this._ray.o, this.node.worldPosition);
        if (PhysicsSystem.instance.raycastClosest(this._ray)) {
            var res = PhysicsSystem.instance.raycastClosestResult;
            this._height = this.node.worldPosition.y - res.hitPoint.y;
            UtilVec3.copy(this._hitPos, res.hitPoint);
            this._hitPos.y += 0.05;
            this.particle_high_light.startSpeed.constant = this._height * this.rate_high_light;//this._curverange;
        } else {
            this._height = 0;
        }
        
        const isShow = this._height > 0.3;
        this._line.active = isShow;
        this._fxHit.active = isShow;
        this._line.setScale(1, this._height * 3, 1);
        this._fxHit.setWorldPosition(this._hitPos);
    }

}

