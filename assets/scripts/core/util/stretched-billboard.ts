import { _decorator, Camera, Component, Node } from 'cc';
import { CameraSetting } from '../../../../extensions/pipeline/pipeline/camera-setting';
const { ccclass, property } = _decorator;

@ccclass('StretchedBillboard')
export class StretchedBillboard extends Component {

    target:Node|undefined;

    onEnable() {
        this.target = CameraSetting.main?.camera?.node; 
    }

    update(deltaTime: number) {

        
        
    }
}

