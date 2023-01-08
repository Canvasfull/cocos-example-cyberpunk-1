import { _decorator, Component, Node, find, Camera, v3 } from 'cc';
import { Msg } from '../msg/msg';
import { UtilVec3 } from './util';
const { ccclass, property } = _decorator;

@ccclass('LightFlowCamera')
export class LightFlowCamera extends Component {

    _camera: Node;
    _pos = v3(0, 0, 0);
    _waitFind = 1;

    update(deltaTime: number) {
        if (this._camera === null) {
            this._waitFind -= deltaTime;
            if (this._waitFind < 0) {
                this._waitFind = 1;
                var camera = find('camera_controller/camera_main');
                if (camera !== null) {
                    this._camera = camera;
                }
            }
        } else {
            UtilVec3.copy(this._pos, this._camera.worldPosition);
            this.node.setPosition(this._pos);
        }
    }

}

