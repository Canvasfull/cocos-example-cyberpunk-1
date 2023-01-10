import { _decorator, Component, geometry, PhysicsSystem, Node, v3, Color, Vec3, color } from 'cc';
import { EDITOR } from 'cc/env';
import { Gizmo, UtilVec3 } from '../core/util/util';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestNormal')
@executeInEditMode
export class TestNormal extends Component {

    direction = v3(0, 0, 0);
    normal = v3(0, 0, 0);
    startPos = v3(0, 0, 0);

    @property
    moveDirection = v3(0, 0, 0);

    ray = new geometry.Ray();

    p0 = v3(0, 0, 0);

    start() {

    }

    update(deltaTime: number) {

        if(EDITOR) {
            this.calculateSlopDirection();
        }
        
    }

    calculateSlopeDirection() {
        const ray = this.ray;
        const mask = 0;
        const distance = 0.4

        const p0 = v3(0, 0, 0);
        const p1 = v3(0, 0, 0);

        let dir = v3(0, -1, 0);

        const position = this.node.position.clone();

        position.add(dir);

        UtilVec3.copy(ray.o, this.node.position);
        ray.d = v3(0, -1, 0);

        Gizmo.drawLine(ray.o, position);

        if (PhysicsSystem.instance.raycastClosest(ray, undefined, distance)) {
            const hit1 = PhysicsSystem.instance.raycastClosestResult;
            const pos = hit1.hitPoint.clone();
            const p0 = hit1.hitPoint.clone();
            console.log(hit1.hitNormal);
            Gizmo.drawLine(hit1.hitPoint, pos.add(hit1.hitNormal).multiplyScalar(2), Color.RED);

            Gizmo.drawLine(this.node.worldPosition, p0, Color.GREEN);
            ray.o.z = 0.03;
            ray.o.x = 0.03
            const o1 = ray.o.clone();
            Gizmo.drawLine(ray.o, o1.add(dir));
            if(PhysicsSystem.instance.raycastClosest(ray, undefined, distance)) {
                const hit2 = PhysicsSystem.instance.raycastClosestResult;
                const pos2 = hit2.hitPoint.clone();
                const p1 = hit2.hitPoint.clone();
                Gizmo.drawLine(this.node.worldPosition, p1, Color.YELLOW);
                UtilVec3.copy(this.direction, p1);
                this.direction.subtract(p0).normalize();

                Vec3.cross(this.normal, p0.subtract(this.node.worldPosition), p1.subtract(this.node.worldPosition))

                const n = v3(0, 0, 0);
                UtilVec3.copy(n, this.node.worldPosition);
                n.add(this.normal);
                Gizmo.drawLine(this.node.worldPosition, n, Color.CYAN);
            }
            
        } 
    }

    calculateSlopNormal() {
        const ray = this.ray
        const mask = 0;
        const distance = 0.4

        const p0 = v3(0, 0, 0);
        const p1 = v3(0, 0, 0);
        const p2 = v3(0, 0, 0);

        let dir = v3(0, -1, 0);

        const position = this.node.position.clone();

        position.add(dir);

        UtilVec3.copy(ray.o, this.node.position);
        ray.d = v3(0, -1, 0);

        Gizmo.drawLine(ray.o, position);

        if (PhysicsSystem.instance.raycastClosest(ray, undefined, distance)) {
            const hit1 = PhysicsSystem.instance.raycastClosestResult;
            const p0 = hit1.hitPoint.clone();
            Gizmo.drawLine(this.node.worldPosition, p0, Color.GREEN);
            ray.o.z = 0.03;
            ray.o.x = 0.03
            const o1 = ray.o.clone();

            if(PhysicsSystem.instance.raycastClosest(ray, undefined, distance)) {
                const hit2 = PhysicsSystem.instance.raycastClosestResult;
                Gizmo.drawLine(ray.o, hit2.hitPoint);
                UtilVec3.copy(p1, hit2.hitPoint);
                Gizmo.drawLine(this.node.worldPosition, ray.o, Color.YELLOW);
                //UtilVec3.copy(this.direction, p1);
                //this.direction.subtract(p0).normalize();
            }
            

            ray.o.z = -0.03;
            ray.o.x = -0.03
            if(PhysicsSystem.instance.raycastClosest(ray, undefined, distance)) {
                const hit3 = PhysicsSystem.instance.raycastClosestResult;
                UtilVec3.copy(p2, hit3.hitPoint);
                Gizmo.drawLine(ray.o, hit3.hitPoint);
                Gizmo.drawLine(this.node.worldPosition, ray.o, Color.YELLOW);

                Gizmo.drawLine(p0, p1, Color.RED);
                Gizmo.drawLine(p0, p2, Color.RED);

                
                Vec3.cross(this.normal, p1.subtract(p0), p2.subtract(p0));

                const n = v3(0, 0, 0);
                UtilVec3.copy(n, p0);
                n.add(this.normal);
                Gizmo.drawLine(p0, n, Color.RED);

                UtilVec3.copy(this.startPos, p0);
                
                
            }
            
        }
    }

    calculateSlopDirection() {

        const moveLength = this.moveDirection.length();

        console.log(moveLength);
        
        if(this.ray === undefined) this.ray = new geometry.Ray();

        UtilVec3.copy(this.ray.o, this.node.worldPosition);
        UtilVec3.copy(this.direction, this.moveDirection);

        this.ray.d = v3(0, -1, 0);
        
        if (PhysicsSystem.instance.raycastClosest(this.ray, undefined, 1)) {
            const hit1 = PhysicsSystem.instance.raycastClosestResult;
            UtilVec3.copy(this.p0, hit1.hitPoint);
            Gizmo.drawLine(this.ray.o, this.p0, Color.YELLOW);
            this.ray.o.add(this.moveDirection);
            Gizmo.drawLine(this.p0, this.p0.clone().add(this.moveDirection), Color.YELLOW);
            if (PhysicsSystem.instance.raycastClosest(this.ray, undefined, 1)) { 
                const hit2 = PhysicsSystem.instance.raycastClosestResult;
                Gizmo.drawLine(this.ray.o, hit2.hitPoint, Color.GREEN);
                UtilVec3.copy(this.direction, hit2.hitPoint);
                this.direction.subtract(this.p0).normalize().multiplyScalar(moveLength);
                Gizmo.drawLine(this.p0, this.p0.clone().add(this.direction), Color.GREEN);
            }
        }

    }
}