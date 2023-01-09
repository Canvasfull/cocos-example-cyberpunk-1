import { _decorator, Component, geometry, PhysicsSystem, Node, v3 } from 'cc';
import { EDITOR } from 'cc/env';
import { Gizmo, UtilVec3 } from '../core/util/util';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('test_normal')
@executeInEditMode
export class test_normal extends Component {

    start() {

    }

    update(deltaTime: number) {

        if(EDITOR) {

            const ray = new geometry.Ray();
            const mask = 0;
            const distance = 0.4

            let dir = v3(0, -1, 0);

            const position = this.node.position.clone();

            position.add(dir);

            UtilVec3.copy(ray.o, this.node.position);

            ray.d = v3(0, -1, 0);

            Gizmo.drawLine(ray.o, position);

            if (PhysicsSystem.instance.raycastClosest(ray, undefined, distance)) {
                const hit = PhysicsSystem.instance.raycastClosestResult;
                if(hit.hitNormal !== this.node.up) {
                    const pos = hit.hitPoint.clone();
                    console.log(hit.hitNormal);
                    Gizmo.drawLine(hit.hitPoint, pos.add(hit.hitNormal).multiplyScalar(2));
    
                }
            }
        }
        
    }
}