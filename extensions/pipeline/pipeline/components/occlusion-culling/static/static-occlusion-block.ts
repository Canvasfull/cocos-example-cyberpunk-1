import { InstancedBuffer, MeshRenderer, Vec3, _decorator } from "cc"

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

    bakedInstances = false
    instances: Set<InstancedBuffer> = new Set
    bakeInstances () {
        if (this.bakedInstances) {
            return;
        }

        let instances = this.instances;
        instances.clear();

        let renderers = this.renderers;
        for (let i = 0; i < renderers.length; i++) {
            let renderer = renderers[i];
            if (!renderer) continue;

            let originState = renderer.enabled
            renderer.enabled = true;

            renderer.node.updateWorldTransform();
            (renderer.model as any)._localDataUpdated = true;
            renderer.model.updateUBOs(0)

            let subs = renderer.model.subModels;
            for (let j = 0; j < subs.length; j++) {
                let passes = subs[j].passes;
                for (let pi = 0; pi < passes.length; pi++) {
                    let buffer = passes[pi].getInstancedBuffer(1000 + this.blockIdx);
                    buffer.merge(subs[j], pi);
                    instances.add(buffer)
                }
            }

            renderer.enabled = originState;
            this.bakedInstances = true;
        }

        for (let i of instances) {
            i.originClear = i.clear
            i.clear = function () { }

            let originUpload = i.uploadBuffers
            i.uploadBuffers = function (cmdBuffer) {
                if (this.uploaded) {
                    return;
                }
                this.uploaded = true;
                originUpload.call(this, cmdBuffer)
            }
        }
    }

    @property
    blockIdx = 0;

    bakingTotalCount = 0;
    bakingDirections: Vec3[] = [];
}
