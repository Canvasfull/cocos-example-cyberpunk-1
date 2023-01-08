import { _decorator, Component, Node, SkinnedMeshRenderer, v4, v3, Vec3, clamp01, Material } from 'cc';
import { UtilVec3 } from '../../core/util/util';
import { TestColliderMeshSwitch } from '../../test/test-collider-mesh-switch';
const { ccclass, property } = _decorator;

@ccclass('FxGhostVertex')
export class FxGhostVertex extends Component {

    @property
    intensity = 4;

    private materials: Array<Material> = [];

    private directionUniform = v4();
    private direction: Vec3 = v3();

    private currentPosition: Vec3 | undefined;
    private lastPosition: Vec3 | undefined;

    private t = 0;

    start() {
        this.currentPosition = this.node.position.clone();
        this.lastPosition = this.currentPosition.clone();

        let components = this.node.getComponentsInChildren(SkinnedMeshRenderer);
        components.forEach(
            (comp) => {
                this.materials.push(comp.material!);
            }
        );
    }

    update(deltaTime: number) {
        UtilVec3.copy(this.currentPosition!, this.node.worldPosition);

        if (this.currentPosition!.equals(this.lastPosition!)) {
            this.t = 0;
        }

        this.t += deltaTime;
        this.t = clamp01(this.t);
        Vec3.lerp(this.lastPosition!, this.lastPosition!, this.currentPosition!, this.t);
        Vec3.subtract(this.direction, this.lastPosition!, this.currentPosition!).multiplyScalar(this.intensity);

        this.materials.forEach(
            (material: Material) => {
                let handle = material.passes[0].getHandle("direction")
                material.passes[0].getUniform(handle, this.directionUniform);
                this.directionUniform.set(
                    this.direction.x,
                    this.direction.y,
                    this.direction.z,
                    this.directionUniform.w,
                );
                material.passes[0].setUniform(handle, this.directionUniform);
            }
        );
    }
}

