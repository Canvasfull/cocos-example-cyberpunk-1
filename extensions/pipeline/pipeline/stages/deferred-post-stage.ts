import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString, Vec4, game, Material } from "cc";
import { getCameraUniqueID } from "../utils/utils";
import { passUtils } from "../utils/pass-utils";
import { settings } from "./setting";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredPostStage')
export class DeferredPostStage extends BaseStage {
    _materialName = 'final-post';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    // uniqueStage = true;

    @property
    name = 'DeferredPostStage'

    @property({ override: true, type: CCString })
    outputNames = ['DeferredPostColor', 'DeferredPostDS']

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        const input0 = this.lastStage.slotName(camera, 0);
        const slot0 = this.slotName(camera, 0);

        passUtils.clearFlag = camera.clearFlag & gfx.ClearFlagBit.COLOR;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        let material = this.materialMap.get(camera);
        if (!material || material.parent !== this.material) {
            material = new renderer.MaterialInstance({
                parent: this.material
            })
            this.materialMap.set(camera, material);
        }

        passUtils.material = material;

        let shadingScale = this.finalShadingScale()
        material.setProperty('inputViewPort',
            new Vec4(
                // width / Math.floor(game.canvas.width * shadingScale), height / Math.floor(game.canvas.height * shadingScale),
                // width / camera.window.width, height / camera.window.height,
                1, 1,
                settings.outputRGBE ? 1 : 0,
                settings.tonemapped ? 0 : 1
            )
        );

        passUtils.addRasterPass(width, height, 'Postprocess', `CameraPostprocessPass${cameraID}`)
            .setViewport(area.x, area.y, width / shadingScale, height / shadingScale)
            .setPassInput(input0, 'outputResultMap')
            .addRasterView(slot0, Format.RGBA8, false)
            .blitScreen(0)
        // ppl.updateRenderWindow(slot0, camera.window);

        passUtils.pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.UI | SceneFlags.PROFILER);
    }
}
