import { director, geometry, MeshRenderer, Node, renderer, Vec3 } from 'cc';
import { BaseStage } from './stages/base-stage';

export enum InstancedQueueType {
    MapGrass,
    Terrain,
}

class InstancedAreaItem {
    id = -1
    bounding = new geometry.AABB
    queue: any

    constructor (x, y, z, halfExtent, id) {
        let forwardStage = BaseStage.forwardStage as any;
        if (forwardStage) {
            this.queue = new (forwardStage._instancedQueue.constructor)();
        }

        this.bounding.center.set(x + halfExtent, y + halfExtent, z + halfExtent)
        this.bounding.halfExtents.set(halfExtent, halfExtent, halfExtent)

        this.id = id
    }
}

class InstancedArea {
    items: Map<number, InstancedAreaItem> = new Map;

    distanceToCulling = 25

    add (node: Node) {
        const ItemExtent = 5
        const SizeEachRow = 10

        let pos = node.worldPosition
        let index = Math.floor(pos.x / ItemExtent) + Math.floor(pos.z / ItemExtent) * SizeEachRow + Math.floor(pos.y / ItemExtent) * SizeEachRow * SizeEachRow
        let item = this.items.get(index)
        if (!item) {
            item = new InstancedAreaItem(Math.floor(pos.x / ItemExtent) * ItemExtent, Math.floor(pos.y / ItemExtent) * ItemExtent, Math.floor(pos.z / ItemExtent) * ItemExtent, ItemExtent / 2, index)
            this.items.set(index, item)
        }

        let q = item.queue;

        let mrs = node.getComponentsInChildren(MeshRenderer);
        mrs.forEach((mr: MeshRenderer) => {
            if (!mr.node.active) {
                return;
            }

            // if (!mr.model) {
            //     (mr.node as any)._activeInHierarchy = true;
            //     (mr as any)._updateModels();
            // }

            let model = mr.model;
            mr.node.updateWorldTransform();
            (model as any)._localDataUpdated = true;
            model.updateUBOs(0);

            let passIdx = 0;
            for (let i = 0; i < model.subModels.length; i++) {
                const instancedBuffer = model.subModels[i].passes[passIdx].getInstancedBuffer(index);
                instancedBuffer.merge(model.subModels[i], model.instancedAttributes, passIdx);
                q.queue.add(instancedBuffer);
            }
        })

        // let total = 0
        // this.items.forEach(i => {
        //     i.queue.queue.forEach(ib => {
        //         ib.instances.forEach(i => {
        //             total += i.count
        //         })
        //     })
        // })
    }

    clear () {
        this.items.forEach(i => {
            i.queue.clear()
        })
    }

    enable (enabled: boolean, camera: renderer.scene.Camera) {
        let forwardStage = BaseStage.forwardStage as any;

        let enableDistanceCulling = director.getScene().name !== 'scene-logo'

        let frustum = camera && camera.frustum
        this.items.forEach(i => {
            let q = i.queue
            let index = forwardStage.additiveInstanceQueues.indexOf(q);
            if (enabled) {
                if (frustum && !geometry.intersect.aabbFrustum(i.bounding, frustum)) {
                    return
                }
                if (enableDistanceCulling) {
                    let dist = Vec3.distance(camera.node.worldPosition, i.bounding.center)
                    if (dist > this.distanceToCulling) {
                        return
                    }
                }
                if (q && index == -1) {
                    forwardStage.additiveInstanceQueues.push(q);
                }
            }
            else {
                if (index !== -1) {
                    forwardStage.additiveInstanceQueues.splice(index, 1);
                }
            }
        })
    }
}

class InstancedQueue {
    _queues: InstancedArea[] = [];

    clear (type: InstancedQueueType) {
        let q = this._queues[type];
        if (q) {
            q.clear();
        }
    }

    get (type: InstancedQueueType) {
        let q = this._queues[type];

        if (!q) {
            q = this._queues[type] = new InstancedArea()
        }

        return q;
    }

    enable (type: InstancedQueueType, enabled: boolean, camera: renderer.scene.Camera) {
        let forwardStage = BaseStage.forwardStage as any;
        if (!forwardStage || !forwardStage.additiveInstanceQueues) {
            return;
        }

        let q = this._queues[type];
        if (q) {
            q.enable(enabled, camera)
        }
    }

    enableAll (enabled: boolean, camera: renderer.scene.Camera) {
        let forwardStage = BaseStage.forwardStage as any;
        if (!forwardStage || !forwardStage.additiveInstanceQueues) {
            return;
        }

        for (let i = 0; i < this._queues.length; i++) {
            let q = this._queues[i];
            if (q) {
                q.enable(enabled, camera)
            }
        }
    }

    add (type: InstancedQueueType, node: Node) {
        let q = this.get(type);
        if (q) {
            q.add(node)
        }
    }
}

export let instancedQueue = new InstancedQueue;
globalThis.instancedQueue = instancedQueue;
