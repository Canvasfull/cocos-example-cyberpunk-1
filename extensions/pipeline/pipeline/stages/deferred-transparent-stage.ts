import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { EDITOR } from "cc/env";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredTransparentStage')
export class DeferredTransparentStage extends BaseStage {
    _name = 'DeferredTransparentStage'
    _materialName = 'blit-screen';

    @property(String)
    outputNames = ['transparent']

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        if (!this.material) {
            return;
        }

        const size = this.finalShadingSize(camera)
        let width = size.x;
        let height = size.y;

        // let isOffScreen = !this.renderToScreen;

        const slot0 = this.slotName(camera, 0);
        if (!ppl.containsResource(slot0)) {
            // if (!isOffScreen) {
            // ppl.addRenderTexture(slot0, this.textureFormat, width, height, camera.window);
            // } else {
            ppl.addRenderTarget(slot0, this.textureFormat, width, height, ResourceResidency.MANAGED);
            // }
        }
        const pass = ppl.addRasterPass(width, height, 'Blit');
        pass.name = `${slot0}_Pass`

        let inputName = 'gBufferColor';//this.lastStage.slotName(camera, 0)
        if (ppl.containsResource(inputName)) {
            let cv = new ComputeView
            cv.name = 'inputTexture'
            pass.addComputeView(inputName, cv);
        }

        const passView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR,
            StoreOp.STORE,
            camera.clearFlag,
            new Color(0.2, 0.2, 0.2, camera.clearColor.w));
        pass.addRasterView(slot0, passView);

        // const passDSView = new RasterView('_',
        //     AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
        //     LoadOp.LOAD, StoreOp.STORE,
        //     camera.clearFlag,
        //     new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        // pass.addRasterView('gBufferDS', passDSView);

        pass.addQueue(QueueHint.NONE).addFullscreenQuad(
            this.material, 0, SceneFlags.NONE,
        );

        pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.TRANSPARENT_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.GEOMETRY);
    }
}
