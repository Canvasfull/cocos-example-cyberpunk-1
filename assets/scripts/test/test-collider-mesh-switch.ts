import { _decorator, Component, MeshRenderer } from 'cc';
import { Game } from '../logic/data/game';
const { ccclass, property } = _decorator;

@ccclass('TestColliderMeshSwitch')
export class TestColliderMeshSwitch extends Component {

    @property
    meshRenderState:boolean = false;

    start() {
        this.meshRenderState = Game.Instance._data.show_collider;
        console.log("meshRenderState:", this.meshRenderState);
        const meshRenders = this.getComponentsInChildren(MeshRenderer);
        for (let i = 0; i < meshRenders.length; i++) {
            meshRenders[i].enabled = this.meshRenderState;
        }
    }
}
