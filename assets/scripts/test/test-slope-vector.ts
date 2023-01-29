import { _decorator, Color, Component, geometry, Node, PhysicsSystem, v3, Vec3 } from 'cc';
import { Gizmo, UtilVec3 } from '../core/util/util';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestSlopeVector')
@executeInEditMode
export class TestSlopeVector extends Component {

    @property([Number])
    masks = [];

    @property(Number)
    distance = 0.5;

    @property(Vec3)
    direction = v3(0, 0, 1);

    _mask:number = 0;
    _ray: geometry.Ray = new geometry.Ray();
    hitPoint = v3(0.5, 0, 0.5);

    @property(Vec3)
    vectorSlop = v3(0, 0, 0);


    start() {
        for(let i = 0; i < this.masks.length; i++)
            this._mask = this._mask | 1 << this.masks[i];
    }

    update(deltaTime: number) {

        if(EDITOR) {

            UtilVec3.copy(this._ray.o, this.direction);
            this._ray.o.multiplyScalar(0.1);
            this._ray.o.add(this.node.worldPosition);
            this._ray.o.y += 0.1;
            this._ray.d.y = -1;
            this._ray.d.x = 0;
            this._ray.d.z = 0;
            this._mask = 1 << 0;
            
            if(PhysicsSystem.instance.raycastClosest(this._ray, undefined, this.distance)) {
                UtilVec3.copy(this.hitPoint, PhysicsSystem.instance.raycastClosestResult.hitPoint);
                UtilVec3.copy(this.vectorSlop, this.hitPoint);
                this.vectorSlop.subtract(this.node.worldPosition);
            }else{
                UtilVec3.copy(this.hitPoint, Vec3.ZERO);
                UtilVec3.copy(this.vectorSlop, Vec3.ZERO);
                console.log('no hit ');
            }

            Gizmo.drawBox(this._ray.o, v3(0.1, 0.1, 0.1), Color.YELLOW);

            Gizmo.drawLine(this._ray.o, this._ray.d.add(this._ray.o), Color.BLUE);

        }

    }
}

