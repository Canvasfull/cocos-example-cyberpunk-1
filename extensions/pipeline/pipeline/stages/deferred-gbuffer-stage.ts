import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString } from "cc";
import { getCameraUniqueID, SRGBToLinear } from "../utils/utils";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredGBufferStage')
export class DeferredGBufferStage extends BaseStage {
    _name = 'DeferredGBufferStage'
    _materialName = 'blit-screen';

    @property({ override: true, type: CCString })
    outputNames = ['gBufferColor', 'gBufferNormal', 'gBufferEmissive', 'gBufferDS']

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const size = this.finalShadingSize(camera)
        const width = size.x;
        const height = size.y;

        const cameraID = getCameraUniqueID(camera);
        const slot0 = this.slotName(camera, 0);
        const slot1 = this.slotName(camera, 1);
        const slot2 = this.slotName(camera, 2);
        const slot3 = this.slotName(camera, 3);
        if (!ppl.containsResource(slot0)) {
            const colFormat = Format.RGBA16F;

            ppl.addRenderTarget(slot0, colFormat, width, height, ResourceResidency.MANAGED);
            ppl.addRenderTarget(slot1, colFormat, width, height, ResourceResidency.MANAGED);
            ppl.addRenderTarget(slot2, colFormat, width, height, ResourceResidency.MANAGED);
            ppl.addDepthStencil(slot3, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }
        // gbuffer pass
        const gBufferPass = ppl.addRasterPass(width, height, 'Geometry',);
        gBufferPass.name = `${slot0}_Pass`

        const rtColor = new Color(0, 0, 0, 0);
        if (camera.clearFlag & ClearFlagBit.COLOR) {
            if (ppl.pipelineSceneData.isHDR) {
                SRGBToLinear(rtColor, camera.clearColor);
            } else {
                rtColor.x = camera.clearColor.x;
                rtColor.y = camera.clearColor.y;
                rtColor.z = camera.clearColor.z;
            }
        }
        const passColorView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            rtColor);
        const passNormalView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            new Color(0, 0, 0, 0));
        const passEmissiveView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            new Color(0, 0, 0, 0));
        const passDSView = new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        gBufferPass.addRasterView(slot0, passColorView);
        gBufferPass.addRasterView(slot1, passNormalView);
        gBufferPass.addRasterView(slot2, passEmissiveView);
        gBufferPass.addRasterView(slot3, passDSView);
        gBufferPass
            .addQueue(QueueHint.RENDER_OPAQUE)
            .addSceneOfCamera(camera, new LightInfo(), SceneFlags.OPAQUE_OBJECT | SceneFlags.CUTOUT_OBJECT | SceneFlags.DRAW_INSTANCING);
    }
}
