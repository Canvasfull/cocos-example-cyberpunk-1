import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString, sys, director } from "cc";
import { getCameraUniqueID, getRenderArea, SRGBToLinear } from "../utils/utils";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredGBufferStage')
export class DeferredGBufferStage extends BaseStage {
    _name = 'DeferredGBufferStage'
    _materialName = 'blit-screen';

    @property({ override: true, type: CCString })
    outputNames = ['gBufferColor', 'gBufferNormal', 'gBufferEmissive', 'gBufferPosition', 'gBufferDS']

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        // hack: use fog uniform to set deferred pipeline
        director.root.pipeline.pipelineSceneData.fog.fogStart = 1;

        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        const slot0 = this.slotName(camera, 0);
        const slot1 = this.slotName(camera, 1);
        const slot2 = this.slotName(camera, 2);
        const slot3 = this.slotName(camera, 3);
        const slot4 = this.slotName(camera, 4);
        if (!ppl.containsResource(slot0)) {
            const colFormat = Format.RGBA16F;

            let posFormat = colFormat;
            if (!sys.isMobile) {
                posFormat = Format.RGBA32F
            }

            ppl.addRenderTarget(slot0, colFormat, width, height, ResourceResidency.MANAGED);
            ppl.addRenderTarget(slot1, colFormat, width, height, ResourceResidency.MANAGED);
            ppl.addRenderTarget(slot2, colFormat, width, height, ResourceResidency.MANAGED);
            ppl.addRenderTarget(slot3, posFormat, width, height, ResourceResidency.MANAGED);
            ppl.addDepthStencil(slot4, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }
        else {
            ppl.updateRenderTarget(slot0, width, height);
            ppl.updateRenderTarget(slot1, width, height);
            ppl.updateRenderTarget(slot2, width, height);
            ppl.updateRenderTarget(slot3, width, height);
            ppl.updateDepthStencil(slot4, width, height);
        }

        // gbuffer pass
        const pass = ppl.addRasterPass(width, height, 'Geometry',);
        pass.name = `${slot0}_Pass`
        pass.setViewport(new Viewport(area.x, area.y, width, height));

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
        const slot3View = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        const slot4View = new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        pass.addRasterView(slot0, passColorView);
        pass.addRasterView(slot1, passNormalView);
        pass.addRasterView(slot2, passEmissiveView);
        pass.addRasterView(slot3, slot3View);
        pass.addRasterView(slot4, slot4View);
        pass.addQueue(QueueHint.RENDER_OPAQUE)
            .addSceneOfCamera(camera, new LightInfo(), SceneFlags.OPAQUE_OBJECT | SceneFlags.CUTOUT_OBJECT | SceneFlags.DRAW_INSTANCING);
    }
}
