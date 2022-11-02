import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { EDITOR } from "cc/env";
import { PipelineAssets } from "../resources/pipeline-assets";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('DeferredPostStage')
export class DeferredPostStage extends BaseStage {
    _name = 'DeferredPostStage'
    _materialName = 'final-post';

    uniqueStage = true;

    @property({ override: true, type: CCString })
    outputNames = ['DeferredPostColor', 'DeferredPostDS']

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        let material = PipelineAssets.instance.getMaterial(this._materialName);
        if (!material) {
            return;
        }

        let inputTex = this.lastStage.slotName(camera, 0);

        const cameraID = getCameraUniqueID(camera);
        const area = getRenderArea(camera, camera.window.width, camera.window.height);
        const width = area.width;
        const height = area.height;
        const slot0 = this.slotName(camera, 0);
        const slot1 = this.slotName(camera, 1);
        if (!ppl.containsResource(slot0)) {
            ppl.addRenderTexture(slot0, Format.RGBA8, width, height, camera.window);
            ppl.addDepthStencil(slot1, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }
        ppl.updateRenderWindow(slot0, camera.window);
        const postprocessPass = ppl.addRasterPass(width, height, 'Postprocess');
        postprocessPass.name = `CameraPostprocessPass${cameraID}`;
        postprocessPass.setViewport(new Viewport(area.x, area.y, area.width, area.height));
        if (ppl.containsResource(inputTex)) {
            const computeView = new ComputeView();
            computeView.name = 'outputResultMap';
            postprocessPass.addComputeView(inputTex, computeView);
        }
        const postClearColor = new Color(0, 0, 0, camera.clearColor.w);
        if (camera.clearFlag & ClearFlagBit.COLOR) {
            postClearColor.x = camera.clearColor.x;
            postClearColor.y = camera.clearColor.y;
            postClearColor.z = camera.clearColor.z;
        }
        const postprocessPassView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.RENDER_TARGET),
            StoreOp.STORE,
            camera.clearFlag,
            postClearColor);
        const postprocessPassDSView = new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.DEPTH_STENCIL),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        postprocessPass.addRasterView(slot0, postprocessPassView);
        postprocessPass.addRasterView(slot1, postprocessPassDSView);
        postprocessPass.addQueue(QueueHint.NONE).addFullscreenQuad(
            material, 0, SceneFlags.NONE,
        );
        postprocessPass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.UI | SceneFlags.PROFILER);
    }
}
