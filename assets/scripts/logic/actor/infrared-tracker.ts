import { _decorator, Color, Component, geometry, Node, PhysicsRayResult, PhysicsSystem, v3, Vec2, Vec3 } from 'cc';
import { Gizmo, Util, UtilVec3 } from '../../core/util/util';
import { FxRayLine } from '../effect/fx-ray-line';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('InfraredTracker')
@executeInEditMode
export class InfraredTracker extends Component {

    @property([Number])
    masks : number[] = [];

    @property
    distance = 300;

    @property(Node)
    forwardNode:Node | undefined;

    ray:geometry.Ray | undefined;

    target: Node | undefined;

    mask:number = 0;

    hit:PhysicsRayResult | undefined;

    endPosition = v3(0, 0, 0);

    rayLine:FxRayLine | undefined;

    forward = v3(0, 0, 0);

    direction = v3(0, 0, 0);

    onEnable() {
        this.ray = new geometry.Ray();
        this.mask = Util.calculateMask(this.masks);
        this.rayLine = this.node.children[0].getComponent(FxRayLine)!;
    }

    update(deltaTime: number) {
        UtilVec3.copy(this.ray!.o, this.node.worldPosition);
        UtilVec3.copy(this.direction, this.forwardNode!.worldPosition);
        this.direction.subtract(this.node.worldPosition).normalize();
        UtilVec3.copy(this.ray!.d, this.direction);
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
            console.log('InfraredTracker forward:', this.direction);
            UtilVec3.scaleDirection(this.endPosition, this.direction, this.distance);
        }

        // Update ray line.
        this.rayLine?.setRayLine(this.node.worldPosition, this.endPosition);
        
        if(EDITOR) Gizmo.drawLine(this.ray!.o, this.endPosition, Color.BLUE);
    }
}

