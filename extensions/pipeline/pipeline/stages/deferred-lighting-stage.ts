
import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Material, CCString } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { PipelineAssets } from "../resources/pipeline-assets";
import { EDITOR } from "cc/env";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

let EditorCameras = [
    'Main Camera',
    'scene:material-previewcamera',
    'Scene Gizmo Camera',
    'Editor UIGizmoCamera'
]

@ccclass('DeferredLightingStage')
export class DeferredLightingStage extends BaseStage {
    _name = 'DeferredLightingStage'
    _materialName = 'blit-screen';

    @property({ override: true, type: CCString })
    outputNames = ['DeferredLightingColor', 'DeferredLightingDepth']

    tempMat: Material
    clearMat: renderer.MaterialInstance

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const cameraName = `Camera${cameraID}`;
        // const cameraInfo = buildShadowPasses(cameraName, camera, ppl);
        const area = getRenderArea(camera, camera.window.width, camera.window.height);
        const width = area.width;
        const height = area.height;

        const deferredLightingPassRTName = this.slotName(camera, 0);
        const deferredLightingPassDS = this.slotName(camera, 1);
        if (!ppl.containsResource(deferredLightingPassRTName)) {
            ppl.addRenderTarget(deferredLightingPassRTName, Format.RGBA16F, width, height, ResourceResidency.MANAGED);
            ppl.addDepthStencil(deferredLightingPassDS, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }
        // lighting pass
        const lightingPass = ppl.addRasterPass(width, height, 'Lighting');
        lightingPass.name = `CameraLightingPass${cameraID}`;
        lightingPass.setViewport(new Viewport(area.x, area.y, width, height));

        // for (const dirShadowName of cameraInfo.mainLightShadowNames) {
        //     if (ppl.containsResource(dirShadowName)) {
        //         const computeView = new ComputeView();
        //         lightingPass.addComputeView(dirShadowName, computeView);
        //     }
        // }
        // for (const spotShadowName of cameraInfo.spotLightShadowNames) {
        //     if (ppl.containsResource(spotShadowName)) {
        //         const computeView = new ComputeView();
        //         lightingPass.addComputeView(spotShadowName, computeView);
        //     }
        // }

        let input0 = this.lastStage.slotName(camera, 0);
        let input1 = this.lastStage.slotName(camera, 1);
        let input2 = this.lastStage.slotName(camera, 2);
        let input3 = this.lastStage.slotName(camera, 3);
        if (ppl.containsResource(input0)) {
            const computeView = new ComputeView();
            computeView.name = 'gbuffer_albedoMap';
            lightingPass.addComputeView(input0, computeView);

            const computeNormalView = new ComputeView();
            computeNormalView.name = 'gbuffer_normalMap';
            lightingPass.addComputeView(input1, computeNormalView);

            const computeEmissiveView = new ComputeView();
            computeEmissiveView.name = 'gbuffer_emissiveMap';
            lightingPass.addComputeView(input2, computeEmissiveView);

            const computeDepthView = new ComputeView();
            computeDepthView.name = 'depth_stencil';
            lightingPass.addComputeView(input3, computeDepthView);
        }
        const lightingClearColor = new Color(0, 0, 0, 0);
        if (camera.clearFlag & ClearFlagBit.COLOR) {
            lightingClearColor.x = camera.clearColor.x;
            lightingClearColor.y = camera.clearColor.y;
            lightingClearColor.z = camera.clearColor.z;
        }
        lightingClearColor.w = 0;
        const lightingPassView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            camera.clearFlag,
            lightingClearColor);
        lightingPass.addRasterView(deferredLightingPassRTName, lightingPassView);

        let material = PipelineAssets.instance.getMaterial('deferred-lighting')
        if (EDITOR && EditorCameras.includes(camera.name)) {
            if (!this.clearMat) {
                this.clearMat = new renderer.MaterialInstance({
                    parent: material,
                })
                this.clearMat.recompileShaders({ CLEAR_LIGHTING: true })
            }
            material = this.clearMat;
        }

        lightingPass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(
            camera, material, 0,
            SceneFlags.VOLUMETRIC_LIGHTING,
        );
        lightingPass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.TRANSPARENT_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.GEOMETRY);
    }
}
