import { _decorator, Component, Node, Camera } from 'cc';
import { Msg } from '../../core/msg/msg';
import { UtilNode } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('CameraMsg')
export class CameraMsg extends Component {


    @property
    msg = "msg_set_camera";

    _cameraNode:Node | undefined;

    start() {

        Msg.bind(this.msg, this.setCamera, this);
        this._cameraNode = this.node.children[0];

    }

    setCamera(active:boolean) {
        this._cameraNode!.active = active;
    }
}

