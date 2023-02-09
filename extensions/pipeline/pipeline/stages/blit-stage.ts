import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag } from "../utils/utils";
import { EDITOR } from "cc/env";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('BlitStage')
export class BlitStage extends BaseStage {
    _materialName = 'blit-screen';

    @property({ override: true })
    name = 'BlitStage'

    @property
    textureFormat = gfx.Format.RGBA8

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        if (!this.material) {
            return;
        }

        const area = this.getRenderArea(camera)
        const width = area.width;
        const height = area.height;

        let isOffScreen = !this.renderToScreen;

        const slot0 = this.slotName(camera, 0);
        if (!ppl.containsResource(slot0)) {
            if (!isOffScreen) {
                ppl.addRenderTexture(slot0, this.textureFormat, width, height, camera.window);
            } else {
                ppl.addRenderTarget(slot0, this.textureFormat, width, height, ResourceResidency.MANAGED);
            }
        }
        const pass = ppl.addRasterPass(width, height, 'Blit');
        pass.name = `${slot0}_Pass`

        let inputName = this.lastStage.slotName(camera, 0)
        if (ppl.containsResource(inputName)) {
            let cv = new ComputeView
            cv.name = 'inputTexture'
            pass.addComputeView(inputName, cv);
        }

        const passView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            isOffScreen ? LoadOp.CLEAR : getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.RENDER_TARGET),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w));
        pass.addRasterView(slot0, passView);

        if (!isOffScreen) {
            // pass.addQueue(QueueHint.NONE).addFullscreenQuad(
            //     this.material, 0, SceneFlags.NONE,
            // );
            pass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(
                camera, this.material, 0,
                SceneFlags.NONE,
            );
        }
    }
}
