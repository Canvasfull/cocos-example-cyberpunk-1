import { _decorator, Component, Node, debug, Camera, Vec3, v3, PhysicsSystem, geometry, IVec3Like, math, url } from 'cc';
import { EDITOR } from 'cc/env';
import { DebugUtil } from '../../core/util/debug-util';
import { Gizmo, u3 } from '../../core/util/util';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('NavigationPoint')
@executeInEditMode
export class NavigationPoint extends Component {

    @property([Node])
    linkNodes:Node[] = [];

    @property([Number])
    weights:number[] = [];

    @property
    radius = 5;

    @property
    showRay = false

    @property
    segment = 20;

    _rays:Array<Vec3> | undefined

    onEnable() {
        // Calculate radius
        if(EDITOR) { 
            const segment = this.segment;
            const ray = new geometry.Ray();
            let minDistance = 200;
            this._rays = Array(segment);
            //Ray test
            for(let i = 0; i < segment; i++) {
                const angle = 360/segment * i;
                let direction = v3(0, this.node.worldPosition.y, -1);
                Vec3.rotateY(direction, direction, this.node.worldPosition, math.toRadian(angle));
                ray.o = this.node.worldPosition;
                ray.d = direction.subtract(this.node.worldPosition);
                this._rays[i] = direction;
                if(PhysicsSystem.instance.raycastClosest(ray, undefined, 100)) {
                    const result = PhysicsSystem.instance.raycastClosestResult;
                    const hitPoint = result.hitPoint;
                    const currentDistance = Vec3.distance(this.node.worldPosition, hitPoint);
                    if(currentDistance < minDistance) {
                        minDistance = currentDistance;
                    }
                }
            }
            this.radius = Number(minDistance.toFixed(3));
        }
    }

    update(deltaTime:number) {
        if(EDITOR) {
            for (let i = 0; i < this.linkNodes.length; i++) {
                Gizmo.drawLine(this.node.worldPosition, this.linkNodes[i].worldPosition);
            }
            Gizmo.drawCircle(this.node.position, this.radius);
            if(this.showRay) {
                for(let i = 0; i < this._rays!.length; i++) {
                    let target = v3(0, 0, 0);
                    u3.c(target, this._rays![i]);
                    Gizmo.drawLine(this.node.worldPosition, target.add(this.node.worldPosition));
                }
            }
        } 
    }

}

