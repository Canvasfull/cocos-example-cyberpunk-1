import { _decorator, Component, Node, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestColliderMeshSwitch')
export class TestColliderMeshSwitch extends Component {

    @property
    meshRenderState:boolean = false;

    start() {
        const meshRenders = this.getComponentsInChildren(MeshRenderer);
        for (let i = 0; i < meshRenders.length; i++) {
            meshRenders[i].enabled = this.meshRenderState;
        }
    }
}
