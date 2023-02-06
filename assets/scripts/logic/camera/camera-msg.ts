import { _decorator, Component, Node, Camera, find } from 'cc';
import { Msg } from '../../core/msg/msg';
import { UtilNode } from '../../core/util/util';
import { StaticOcclusionCulling } from '../../../../extensions/pipeline/pipeline/components/occlusion-culling/static/static-occlusion-culling';
const { ccclass, property } = _decorator;

@ccclass('CameraMsg')
export class CameraMsg extends Component {


    @property
    msg = "msg_set_camera";

    _cameraNode:Node | undefined;

    _camera:Camera | undefined;

    start() {

        Msg.bind(this.msg, this.setCamera, this);
        this._cameraNode = this.node.children[0];
        this._camera = this._cameraNode.getComponent(Camera)!;

    }

    setCamera(active:boolean) {
        this._cameraNode!.active = active;
        if(active) {
            const culling = find('static-occlusion-culling');
            if (culling === undefined || culling === null) {
                console.warn(`Can not find static-occlusion-culling.`);
                return;
            }
            const occlusionCulling = culling.getComponent(StaticOcclusionCulling);
            if(occlusionCulling === null) throw new Error(`culling node not find 'StaticOcclusionCulling'`);

            if(this._camera)
                occlusionCulling.camera = this._camera;
        }

    }
}

