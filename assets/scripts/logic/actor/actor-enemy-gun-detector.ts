import { _decorator, Component, geometry, Node, PhysicsRayResult, PhysicsSystem, v3, Vec2, Vec3 } from 'cc';
import { Util, UtilVec3 } from '../../core/util/util';
import { FxRayLine } from '../effect/fx-ray-line';
const { ccclass, property } = _decorator;

@ccclass('ActorEnemyGunDetector')
export class ActorEnemyGunDetector extends Component {

    @property([Number])
    masks : number[] = [];

    @property
    distance = 300;

    ray:geometry.Ray | undefined;

    target: Node | undefined;

    mask:number = 0;

    hit:PhysicsRayResult | undefined;

    endPosition = v3(0, 0, 0);

    rayLine:FxRayLine | undefined;

    start() {
        this.ray = new geometry.Ray();
        this.mask = Util.calculateMask(this.masks);
        this.updateRay();
        this.rayLine = this.node.children[0].getComponent(FxRayLine)!;
    }

    updateRay() {
        UtilVec3.copy(this.ray!.o, this.node.worldPosition);
        UtilVec3.copy(this.ray!.d, this.node.forward);
    }

    update(deltaTime: number) {
        this.updateRay();
        this.hit = undefined;
        this.target = undefined;
        if (PhysicsSystem.instance.raycastClosest(this.ray!, this.mask, this.distance)) {
            this.hit = PhysicsSystem.instance.raycastClosestResult;
        }
        
        if(this.hit !== undefined) {
            this.target = this.hit.collider.node;
            UtilVec3.copy(this.endPosition, this.hit.hitPoint);
        }else{
            UtilVec3.copy(this.endPosition, this.node.worldPosition);
            UtilVec3.scaleDirection(this.endPosition, this.node.forward, this.distance);
        }

        // Update ray line.
        this.rayLine?.setRayLine(this.node.worldPosition, this.endPosition);
    }
}

