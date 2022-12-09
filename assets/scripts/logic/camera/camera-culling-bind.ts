import { _decorator, Component, Node, Camera } from 'cc';
import { StaticOcclusionCulling } from '../../../../extensions/pipeline/pipeline/components/occlusion-culling/static/static-occlusion-culling';
import { Msg } from '../../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('CameraCullingBind')
export class CameraCullingBind extends Component {

    occlusionCulling:StaticOcclusionCulling | undefined | null;

    start() {
        this.occlusionCulling = this.node.getComponent(StaticOcclusionCulling);
        Msg.bind('msg_bind_occlusion_culling', this.bindOcclusionCulling, this);
    }

    bindOcclusionCulling(camera: Camera) {
        if(this.occlusionCulling) 
            this.occlusionCulling.camera = camera;
    } 

}

