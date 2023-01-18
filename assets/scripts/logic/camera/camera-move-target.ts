import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../../core/util/util';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('CameraMoveTarget')
export class CameraMoveTarget extends Component {

    @property( {type:Node, tooltip:'Target Node'})
    targetNode:Node | undefined;

    @property( { type: Number, tooltip:'Smooth position move.'})
    smoothMove = 5.0;

    @property ( {type: Number, tooltip:'Smooth angle.'} )
    smoothAngle = 5.0;

    @property( {type:Node, tooltip:'Camera Node.'} )
    cameraNode:Node | undefined;

    currentPosition = v3(0, 0, 0);
    currentAngle = v3(0, 0, 0);

    start() {
        Msg.on('msg_change_tps_camera_target', this.setTarget.bind(this));
    }

    update(deltaTime: number) {

        if(!this.targetNode) return;

        // Smooth move position.
        Vec3.lerp(this.currentPosition, this.currentPosition, this.targetNode.position, this.smoothMove * deltaTime);
        this.cameraNode?.setPosition(this.currentPosition);


        // Smooth move angle.
        Vec3.lerp(this.currentAngle, this.currentAngle, this.targetNode.eulerAngles, this.smoothAngle * deltaTime);
        this.cameraNode?.setRotationFromEuler(this.currentAngle);
        
    }

    setTarget(node:Node) {
        
        this.targetNode = node;

    }

}

