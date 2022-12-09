import { _decorator, Component, Node, Game, Camera, find } from 'cc';
import { StaticOcclusionCulling } from '../../../../extensions/pipeline/pipeline/components/occlusion-culling/static/static-occlusion-culling';
import { Msg } from '../../core/msg/msg';
import { UtilNode } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('CameraAutoBindOcclusion')
export class CameraAutoBindOcclusion extends Component {

    onEnable() {
        const culling = find('static-occlusion-culling');
        if (culling === undefined || culling === null) {
            throw new Error(`Can not find static-occlusion-culling.`);
        }
        const occlusionCulling = culling.getComponent(StaticOcclusionCulling);
        if(occlusionCulling === null) throw new Error(`culling node not find 'StaticOcclusionCulling'`);
        occlusionCulling.camera = this.getComponent(Camera);
    }

}

