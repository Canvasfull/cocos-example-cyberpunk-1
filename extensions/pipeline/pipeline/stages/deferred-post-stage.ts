import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { EDITOR } from "cc/env";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredPostStage')
export class DeferredPostStage extends BaseStage {
    _name = 'DeferredPostStage'
    _materialName = 'blit-screen';

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        if (!this.material) {
            return;
        }

        // const size = this.finalShadingSize(camera)
        // let width = size.x;
        // let height = size.y;

        // if (EDITOR) {
        const area = getRenderArea(camera, camera.window.width, camera.window.height);
        let width = area.width;
        let height = area.height;
        // }


        // let isOffScreen = !this.renderToScreen;

        const slot0 = this.slotName(camera, 0);
        if (!ppl.containsResource(slot0)) {
            // if (!isOffScreen) {
            ppl.addRenderTexture(slot0, this.textureFormat, width, height, camera.window);
            // } else {
            //     ppl.addRenderTarget(slot0, this.textureFormat, width, height, ResourceResidency.MANAGED);
            // }
        }
        const pass = ppl.addRasterPass(width, height, 'Blit');
        pass.name = `${slot0}_Pass`
        pass.setViewport(new Viewport(area.x, area.y, area.width, area.height));

        let inputName = this.lastStage.slotName(camera, 0)
        if (ppl.containsResource(inputName)) {
            let cv = new ComputeView
            cv.name = 'inputTexture'
            pass.addComputeView(inputName, cv);
        }

        const passView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.RENDER_TARGET),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w));
        pass.addRasterView(slot0, passView);

        pass.addQueue(QueueHint.NONE).addFullscreenQuad(
            this.material, 0, SceneFlags.NONE,
        );

        pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.UI | SceneFlags.PROFILER);
    }
}
