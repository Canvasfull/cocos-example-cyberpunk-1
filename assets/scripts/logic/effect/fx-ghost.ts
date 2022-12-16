import { _decorator, Component, Node, MeshRenderer, Mesh, SkinnedMeshRenderer } from 'cc';
import { Res } from '../../core/res/res';
import { UtilNode } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('FxGhost')
export class FxGhost extends Component {

    @property
    count = 5;

    @property(Node)
    target:Node|undefined;

    @property
    simpleTime = 1;

    meshRenders:SkinnedMeshRenderer[] | undefined;

    _intervalTime = 0;

    _ghostItems:GhostNode[] = [];

    _eachCount = 0;

    _index = 0;

    _total = 0;

    start() {

        this.meshRenders = this.target!.getComponentsInChildren(SkinnedMeshRenderer);

        console.log(this.meshRenders);

        this._eachCount = this.meshRenders.length;

        const total = this.count * this._eachCount;

        this._total = total;

        this._ghostItems = Array<GhostNode>(total);

        const itemNode = this.node!.children[0];
        this._ghostItems[0] = {
            node:itemNode,
            meshRender:UtilNode.getComponent(itemNode, MeshRenderer),
        }
        for(let i = 1; i < total; i++) {
            const newNode = Res.instNode(itemNode, this.node);
            this._ghostItems[i] = {
                node:newNode,
                meshRender:UtilNode.getComponent(newNode, MeshRenderer),
            }
        }

        console.log(this.meshRenders, this._ghostItems);

    }

    update(deltaTime: number) {

        this._intervalTime -= deltaTime;
        if(this._intervalTime < 0) {
            this.simpleMeshInfo();
            this._intervalTime = this.simpleTime;
        }
        
    }

    simpleMeshInfo() {
        for(let i = 0; i < this._eachCount; i++) {
            const mesh = this.meshRenders![i].mesh;
            const node = this.meshRenders![i].node;
            if(mesh != null) {
                const copyMesh = Object.assign(mesh);
                const ghost = this._ghostItems[this._index];
                ghost.meshRender.mesh = copyMesh;
                ghost.node.setPosition(this._index, node.worldPosition.y, node.worldPosition.z);
                ghost.node.setWorldRotation(node.getWorldRotation());
                this._index++;
                console.log(this._index);
                if(this._index >= this._total) this._index = 0;
            }else{
                console.warn(`${this.meshRenders![i].node.name} Can not find mesh`)
            }
        }
    }
}

export type GhostNode = {
    node: Node,
    meshRender: MeshRenderer,
}