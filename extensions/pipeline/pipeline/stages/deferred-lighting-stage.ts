
import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Material, CCString, Vec4, game } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { PipelineAssets } from "../resources/pipeline-assets";
import { EDITOR } from "cc/env";
import { ExponentialHeightFog, fogUBO } from "../components/fog/height-fog";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

let EditorCameras = [
    'scene:material-previewcamera',
    'Scene Gizmo Camera',
    'Editor UIGizmoCamera',

    'Main Camera',
]

@ccclass('DeferredLightingStage')
export class DeferredLightingStage extends BaseStage {
    _name = 'DeferredLightingStage'
    _materialName = 'blit-screen';

    @property({ override: true, type: CCString })
    outputNames = ['DeferredLightingColor', 'DeferredLightingDepth']

    tempMat: Material
    clearMat: renderer.MaterialInstance
    materialMap: Map<renderer.scene.Camera, Material> = new Map

    uniqueStage = true;

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        // const cameraName = `Camera${cameraID}`;
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

        let sharedMaterial = PipelineAssets.instance.getMaterial('deferred-lighting')
        let material = this.materialMap.get(camera);
        if (!material || material.parent !== sharedMaterial) {
            if (EDITOR && EditorCameras.includes(camera.name)) {
                material = new renderer.MaterialInstance({
                    parent: sharedMaterial,
                })
                material.recompileShaders({ CLEAR_LIGHTING: true })
            }
            else {
                material = new renderer.MaterialInstance({
                    parent: sharedMaterial,
                })
            }
            this.materialMap.set(camera, material);
        }

        material.setProperty('inputViewPort', new Vec4(width / game.canvas.width, height / game.canvas.height, 0, 0));

        fogUBO.update(material);

        lightingPass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(
            camera, material, 0,
            SceneFlags.VOLUMETRIC_LIGHTING,
        );
        lightingPass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.TRANSPARENT_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.GEOMETRY);
    }
}
