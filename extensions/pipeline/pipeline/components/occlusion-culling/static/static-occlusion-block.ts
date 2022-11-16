import { MeshRenderer, Vec3, _decorator } from "cc"

const { ccclass, property } = _decorator

@ccclass('sync.CullingBlock')
export class CullingBlock {
    @property
    center = new Vec3
    @property
    halfExtents = new Vec3

    @property({ visible: false })
    modelIndices: number[] = []

    renderers: MeshRenderer[] = []
    @property
    get rendererCount () {
        return this.modelIndices.length;
    }

    get bakingProcess () {
        if (this.bakingTotalCount === 0) {
            return this.modelIndices.length ? 1 : 0;
        }
        return (this.bakingTotalCount - this.bakingDirections.length) / this.bakingTotalCount;
    }

    blockIdx = 0;

    bakingTotalCount = 0;
    bakingDirections: Vec3[] = [];
}
