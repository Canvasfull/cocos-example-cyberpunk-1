import { _decorator, Component, geometry, Node, physics, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../../core/util/util';
import { Msg } from '../../core/msg/msg';
import { SensorRayNodeToNode } from '../../core/sensor/sensor-ray-node-to-node';
const { ccclass, property } = _decorator;

@ccclass('CameraMoveTarget')
export class CameraMoveTarget extends Component {

    @property( {type:Node, tooltip:'Target Node'})
    targetNode:Node | undefined;

    @property( { type: Number, tooltip:'Smooth position move.'})
    smoothSlowMove = 5.0;

    @property ( {type: Number, tooltip:'Smooth angle.'} )
    smoothAngle = 5.0;

    @property( { type: Number, tooltip:'Smooth position move.'})
    smoothFastMove = 15;

    @property( {type:Node, tooltip:'Camera Node.'} )
    cameraNode:Node | undefined;

    @property( { type:[Node], tooltip:'Target node list.'})
    targets:Node[] = [];

    @property
    waitTime = 10;

    currentPosition = v3(0, 0, 0);
    currentAngle = v3(0, 0, 0);

    sensor:SensorRayNodeToNode | undefined;

    movePosition = v3(0, 0, 0);

    smoothMove = 5.0;

    start() {
        Msg.on('msg_change_tps_camera_target', this.setTarget.bind(this));
        UtilVec3.copy(this.currentPosition, this.cameraNode!.position);
        UtilVec3.copy(this.currentAngle, this.cameraNode!.eulerAngles);
        this.sensor = this.getComponent(SensorRayNodeToNode)!;
    }

    update(deltaTime: number) {

        if(this.waitTime > 0) {
            this.waitTime -= deltaTime;
            return;
        }

        if(!this.targetNode) return;

        // Calculate move position.
        if(this.sensor!.hitPoint.length() > 0) {
            UtilVec3.copy(this.movePosition, this.sensor!.hitPoint);
            this.movePosition.subtract(this.node!.worldPosition);
            const length = this.movePosition.length();
            UtilVec3.copy(this.movePosition, this.targetNode.position);
            this.movePosition.subtract(this.node.position).normalize().multiplyScalar(length);
            this.smoothMove = this.smoothFastMove;
        }else{
            UtilVec3.copy(this.movePosition, this.targetNode.position);
            this.smoothMove = this.smoothSlowMove;
        }
        //const targetPosition = this.sensor!.hitPoint.length() > 0 ? this.sensor!.hitPoint : this.targetNode.position;

        // Smooth move position.
        Vec3.lerp(this.currentPosition, this.currentPosition, this.movePosition, this.smoothMove * deltaTime);
        this.cameraNode?.setPosition(this.currentPosition);


        // Smooth move angle.
        Vec3.lerp(this.currentAngle, this.currentAngle, this.targetNode.eulerAngles, this.smoothAngle * deltaTime);
        this.cameraNode?.setRotationFromEuler(this.currentAngle);
        
    }

    setTarget(index:number) {
        this.targetNode = this.targets[index];
        this.sensor!.endNode = this.targetNode;
    }

}

