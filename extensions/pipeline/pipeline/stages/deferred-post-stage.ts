import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString, Vec4, game, Material } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { EDITOR } from "cc/env";
import { PipelineAssets } from "../resources/pipeline-assets";
import { passUtils } from "../utils/pass-utils";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredPostStage')
export class DeferredPostStage extends BaseStage {
    _name = 'DeferredPostStage'
    _materialName = 'final-post';

    materialMap: Map<renderer.scene.Camera, Material> = new Map

    // uniqueStage = true;

    @property({ override: true, type: CCString })
    outputNames = ['DeferredPostColor', 'DeferredPostDS']

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const area = getRenderArea(camera, camera.window.width, camera.window.height);
        const width = area.width;
        const height = area.height;

        const input0 = this.lastStage.slotName(camera, 0);
        const slot0 = this.slotName(camera, 0);

        passUtils.clearFlag = 0;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        let material = this.materialMap.get(camera);
        if (!material) {
            material = new renderer.MaterialInstance({
                parent: this.material
            })
            this.materialMap.set(camera, material);
        }
        passUtils.material = material;

        material.setProperty('inputViewPort', new Vec4(width / game.canvas.width, height / game.canvas.height, 0, 0));
        // (material.passes[0].descriptorSet as any)._isDirty = true;
        // material.passes[0].update();

        passUtils.addRasterPass(width, height, 'Postprocess', `CameraPostprocessPass${cameraID}`)
            .setViewport(area.x, area.y, width, height)
            .setPassInput(input0, 'outputResultMap')
            .addRasterView(slot0, Format.RGBA8, false)
            .blitScreen(0)
        // ppl.updateRenderWindow(slot0, camera.window);

        passUtils.pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.UI | SceneFlags.PROFILER);
    }
}
