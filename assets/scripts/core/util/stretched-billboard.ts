import { _decorator, Camera, Component, Node } from 'cc';
import { CameraSetting } from '../../../../extensions/pipeline/pipeline/camera-setting';
import { GMath } from './g-math';
const { ccclass, property } = _decorator;

@ccclass('StretchedBillboard')
export class StretchedBillboard extends Component {

    target:Node|undefined;

    update(deltaTime: number) {

        if(this.target === undefined) {
            this.target = CameraSetting.main?.camera?.node;
        }

        if(this.target !== undefined) {
            const billboardAngle = GMath.StretchedBillboardAngle(this.node!.up, this.node!.worldPosition, this.target!.worldPosition, this.node!.forward);

            if(billboardAngle) {
                const angle = this.node.eulerAngles;
                this.node!.setRotationFromEuler(angle.x, angle.y, billboardAngle);
            } 
        }
    }
}

