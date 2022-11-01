import { Component, MeshRenderer, renderer, _decorator } from "cc";

const { ccclass, executeInEditMode } = _decorator;

export let OpaqueDepth = {
    models: [] as renderer.scene.Model[]
}

@ccclass('OpaqueDepthObject')
@executeInEditMode
export class OpaqueDepthObject extends Component {
    onEnable () {
        let mr = this.getComponent(MeshRenderer);
        if (mr && mr.model) {
            OpaqueDepth.models.push(mr.model);
        }
    }
    onDisable () {
        let mr = this.getComponent(MeshRenderer);
        if (mr) {
            let index = OpaqueDepth.models.indexOf(mr.model);
            if (index !== -1) {
                OpaqueDepth.models.splice(index, 1);
            }
        }
    }
}
