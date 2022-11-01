
import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Material } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag } from "../utils/utils";
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

    @property(String)
    outputNames = ['DeferredLightingColor', 'DeferredLightingDepth']

    tempMat: Material
    clearMat: renderer.MaterialInstance

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        if (!PipelineAssets.instance) {
            return;
        }

        let material = PipelineAssets.instance.getMaterial('deferred-lighting')
        if (!material) {
            return;
        }

        const size = this.finalShadingSize(camera)
        const width = size.x;
        const height = size.y;

        let slot0 = this.slotName(camera, 0);
        let slot1 = this.slotName(camera, 1);
        if (!ppl.containsResource(slot0)) {
            ppl.addRenderTarget(slot0, Format.RGBA8, width, height, ResourceResidency.MANAGED);
        }
        // lighting pass
        const lightingPass = ppl.addRasterPass(width, height, 'Lighting');
        lightingPass.name = `${slot0}_Pass`
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

        let inputSlot0 = this.lastStage.slotName(camera, 0);
        let inputSlot1 = this.lastStage.slotName(camera, 1);
        let inputSlot2 = this.lastStage.slotName(camera, 2);
        let inputSlot3 = this.lastStage.slotName(camera, 3);

        if (ppl.containsResource(inputSlot0)) {
            const computeView = new ComputeView();
            computeView.name = 'gbuffer_albedoMap';
            lightingPass.addComputeView(inputSlot0, computeView);

            const computeNormalView = new ComputeView();
            computeNormalView.name = 'gbuffer_normalMap';
            lightingPass.addComputeView(inputSlot1, computeNormalView);

            const computeEmissiveView = new ComputeView();
            computeEmissiveView.name = 'gbuffer_emissiveMap';
            lightingPass.addComputeView(inputSlot2, computeEmissiveView);

            const computeDepthView = new ComputeView();
            computeDepthView.name = 'depth_stencil';
            lightingPass.addComputeView(inputSlot3, computeDepthView);
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
        lightingPass.addRasterView(slot0, lightingPassView);

        if (material !== this.tempMat) {
            let pass = material.passes[0]
            pass.beginChangeStatesSilently();
            pass.tryCompile();
            pass.endChangeStatesSilently();

            this.tempMat = material
        }
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
    }
}
