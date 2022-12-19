import { _decorator, Component, Vec3, v3, v2, random, RigidBody, inverseLerp } from 'cc';
import { SensorRaysAngle } from '../../core/sensor/sensor-rays-angle';
import { UtilNode } from '../../core/util/util';

const { ccclass } = _decorator;

@ccclass('ActorPhysicalSkin')
export class ActorPhysicalSkin extends Component {

    sensor:SensorRaysAngle | undefined;
    rigid:RigidBody | undefined;
    velocity:Vec3 = v3(0, 0, 0); 
    dir:Vec3 = v3(0, 0, 0);
    velocityPlane:Vec3 = v3(0, 0, 0);
    inverseForce:Vec3 = v3(0, 0, 0);

    start() {
        this.sensor = UtilNode.getChildComponent(this.node, 'skin', SensorRaysAngle); //this.node.getChildByName('skin').getComponent(SensorRaysAngle);
        this.rigid = UtilNode.getComponent(this.node, RigidBody); //this.getComponent(RigidBody);
        this.velocity = v3(0, 0, 0);
    }

    lateUpdate(deltaTime:number) {
        /*
        if (this.sensor!.checked) {
            this.rigid!.getLinearVelocity(this.velocity); 
            // change move direction.
            const position = this.node.worldPosition;
            this.dir.x = this.sensor!.hitPoint.x - position.x;
            this.dir.z = this.sensor!.hitPoint.z - position.z;

            this.velocityPlane.x = this.velocity.x;
            this.velocityPlane.z = this.velocity.z;

            if (Vec3.angle(this.dir, this.velocityPlane) < 10) {
                //this.velocity.x = 0;
                //this.velocity.z = 0;
                this.velocity = this.velocity.normalize().multiplyScalar(3);
                this.rigid!.setLinearVelocity(this.velocity);
                // add inverse force.
                //this.inverseForce.x = -this.velocity.x;
                //this.inverseForce.z = -this.velocity.z;
                //this.rigid.applyImpulse(this.inverseForce.normalize().multiplyScalar(1));

            }

        }
        */
    }

}