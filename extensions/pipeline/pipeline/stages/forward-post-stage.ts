import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString, Vec4, game, Material, director } from "cc";
import { getCameraUniqueID } from "../utils/utils";
import { passUtils } from "../utils/pass-utils";
import { settings } from "./setting";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('ForwardPostStage')
export class ForwardPostStage extends BaseStage {
    _materialName = 'blit-screen';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    // uniqueStage = true;

    @property
    name = 'ForwardPostStage'

    @property({ override: true, type: CCString })
    outputNames = ['ForwardPostColor']

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
        let isOffScreen = director.root.mainWindow !== camera.window;

        passUtils.addRasterPass(width, height, 'post-process', `CameraPostprocessPass${cameraID}`)
            .setViewport(area.x, area.y, width / shadingScale, height / shadingScale)
            .setPassInput(input0, 'inputTexture')
            .addRasterView(slot0, Format.RGBA8, isOffScreen)
            .blitScreen(0)
        // ppl.updateRenderWindow(slot0, camera.window);

        if (!settings.renderedProfiler) {
            passUtils.pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
                SceneFlags.UI | SceneFlags.PROFILER);
            settings.renderedProfiler = true
        }
    }
}
