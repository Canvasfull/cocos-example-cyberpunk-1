import { _decorator, Component, MeshRenderer } from 'cc';
import { DataGameInst } from '../logic/data/data-core';
const { ccclass, property } = _decorator;

@ccclass('TestColliderMeshSwitch')
export class TestColliderMeshSwitch extends Component {

    @property
    meshRenderState:boolean = false;

    start() {
        this.meshRenderState = DataGameInst._data.show_collider;
        console.log("meshRenderState:", this.meshRenderState);
        const meshRenders = this.getComponentsInChildren(MeshRenderer);
        for (let i = 0; i < meshRenders.length; i++) {
            meshRenders[i].enabled = this.meshRenderState;
        }
    }
}
