
import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Material, CCString, Vec4, game, director, ReflectionProbe, TextureCube } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { EDITOR } from "cc/env";
import { ExponentialHeightFog, fogUBO } from "../components/fog/height-fog";
import { ReflectionProbes } from "../components/reflection-probe-utils";
import { DeferredGBufferStage } from "./deferred-gbuffer-stage";
import { settings } from "./setting";
import { CustomShadowStage } from "./shadow-stage";
import { LightWorldCluster } from "../components/cluster/light-cluster";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

let EditorCameras = [
    'scene:material-previewcamera',
    'Scene Gizmo Camera',
    'Editor UIGizmoCamera',

    'Main Camera',
]

let tempVec4 = new Vec4

@ccclass('DeferredLightingStage')
export class DeferredLightingStage extends BaseStage {
    _materialName = 'blit-screen';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    tempMat: Material
    clearMat: renderer.MaterialInstance

    uniqueStage = true;

    probes: ReflectionProbe[] = []

    @property
    name = 'DeferredLightingStage'

    @property({ override: true, type: CCString })
    outputNames = ['DeferredLightingColor', 'gBufferDS']

    updateClusterUBO (setter: any, material: Material) {
        let cluster = globalThis.LightWorldCluster.instance as LightWorldCluster;
        material.setProperty('light_cluster_BoundsMin', tempVec4.set(cluster.boundsMin.x, cluster.boundsMin.y, cluster.boundsMin.z, 1))
        material.setProperty('light_cluster_BoundsDelta', tempVec4.set(cluster.boundsDelta.x, cluster.boundsDelta.y, cluster.boundsDelta.z, 1))
        material.setProperty('light_cluster_CellsDot', cluster.clusterCellsDotData)
        material.setProperty('light_cluster_CellsMax', cluster.clusterCellsMaxData)
        material.setProperty('light_cluster_TextureSize', cluster.clusterTextureSizeData)
        material.setProperty('light_cluster_InfoTextureInvSize', cluster.infoTextureInvSizeData)
        material.setProperty('light_cluster_CellsCountByBoundsSizeAndPixelsPerCell', cluster.clusterCellsCountByBoundsSizeData)

        if (EDITOR) {
            material.setProperty('light_cluster_InfoTexture', cluster.dataInfoTextureFloat)
            material.setProperty('light_cluster_Texture', cluster.clusterTexture)

            let pass = material.passes[0];
            let pointSampler = director.root.pipeline.globalDSManager.pointSampler
            let binding = pass.getBinding('light_cluster_InfoTexture')
            pass.bindSampler(binding, pointSampler)
            binding = pass.getBinding('light_cluster_Texture')
            pass.bindSampler(binding, pointSampler)
        }
        else {
            setter.setTexture('light_cluster_InfoTexture', cluster.dataInfoTextureFloat);
            setter.setTexture('light_cluster_Texture', cluster.clusterTexture);

            let pointSampler = director.root.pipeline.globalDSManager.pointSampler
            setter.setSampler('light_cluster_InfoTexture', pointSampler)
            setter.setSampler('light_cluster_Texture', pointSampler)
        }
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        // const cameraName = `Camera${cameraID}`;
        // const cameraInfo = buildShadowPasses(cameraName, camera, ppl);
        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        const slot0 = this.slotName(camera, 0);
        if (!ppl.containsResource(slot0)) {
            ppl.addRenderTarget(slot0, Format.RGBA16F, width, height, ResourceResidency.MANAGED);
        }
        else {
            ppl.updateRenderTarget(slot0, width, height);
        }

        let slot1 = this.slotName(camera, 1);
        if (settings.gbufferStage) {
            slot1 = settings.gbufferStage.slotName(camera, 4);
        }
        if (!ppl.containsResource(slot1)) {
            ppl.addDepthStencil(slot1, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }

        // lighting pass
        const pass = ppl.addRasterPass(width, height, 'deferred-lighting');
        pass.name = `CameraLightingPass${cameraID}`;
        pass.setViewport(new Viewport(area.x, area.y, width, height));

        let shadowStage: CustomShadowStage = settings.shadowStage;
        if (shadowStage) {
            for (const dirShadowName of shadowStage.mainLightShadows) {
                if (ppl.containsResource(dirShadowName)) {
                    const computeView = new ComputeView();
                    pass.addComputeView(dirShadowName, computeView);
                }
            }
        }

        let input0 = this.lastStage.slotName(camera, 0);
        let input1 = this.lastStage.slotName(camera, 1);
        let input2 = this.lastStage.slotName(camera, 2);
        let input3 = this.lastStage.slotName(camera, 3);
        if (ppl.containsResource(input0)) {
            const computeView = new ComputeView();
            computeView.name = 'gbuffer_albedoMap';
            pass.addComputeView(input0, computeView);

            const computeNormalView = new ComputeView();
            computeNormalView.name = 'gbuffer_normalMap';
            pass.addComputeView(input1, computeNormalView);

            const computeEmissiveView = new ComputeView();
            computeEmissiveView.name = 'gbuffer_emissiveMap';
            pass.addComputeView(input2, computeEmissiveView);

            const computeDepthView = new ComputeView();
            computeDepthView.name = 'gbuffer_posMap';
            pass.addComputeView(input3, computeDepthView);
        }

        const lightingClearColor = new Color(0, 0, 0, 1);
        const slot0View = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            gfx.ClearFlagBit.COLOR,
            lightingClearColor);
        pass.addRasterView(slot0, slot0View);
        const slot1View = new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            LoadOp.LOAD, StoreOp.STORE,
            gfx.ClearFlagBit.NONE,
            lightingClearColor);
        pass.addRasterView(slot1, slot1View);

        let probes = ReflectionProbes.probes
        probes = probes.filter(p => {
            return p.enabledInHierarchy
        })

        let sharedMaterial = globalThis.pipelineAssets.getMaterial('deferred-lighting')
        let material = this.materialMap.get(camera);
        if (!material || material.parent !== sharedMaterial) {
            if (EDITOR && EditorCameras.includes(camera.name)) {
                material = new renderer.MaterialInstance({
                    parent: sharedMaterial,
                })
                material.recompileShaders({ CLEAR_LIGHTING: true })
            }
            else {
                // director.root.pipeline.macros.CC_USE_IBL = 0;

                material = new renderer.MaterialInstance({
                    parent: sharedMaterial,
                })
                material.recompileShaders({
                    // CC_USE_IBL: 0,
                    CC_RECEIVE_SHADOW: 1,
                    REFLECTION_PROBE_COUNT: probes.length
                })
            }
            this.materialMap.set(camera, material);
        }

        if (probes.length !== this.probes.length) {
            material.recompileShaders({ REFLECTION_PROBE_COUNT: probes.length })
        }

        let setter = pass as any;
        setter.addConstant('CustomLightingUBO', 'deferred-lighting');
        for (let i = 0; i < 3; i++) {
            let probe = probes[i];
            if (!probe) break;

            let pos = probe.node.worldPosition;
            let range = Math.max(probe.size.x, probe.size.y, probe.size.z)

            material.setProperty('light_ibl_posRange' + i, tempVec4.set(pos.x, pos.y, pos.z, range))
            let cubemap: TextureCube = (probe as any)._cubemap
            if (EDITOR) {
                material.setProperty('light_ibl_Texture' + i, cubemap)
            }
            else {
                setter.setTexture('light_ibl_Texture' + i, cubemap.getGFXTexture())
                setter.setSampler('light_ibl_Texture' + i, cubemap.getGFXSampler())
            }
        }

        this.probes = probes;

        this.updateClusterUBO(setter, material);

        fogUBO.update(material);

        pass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(
            camera, material, 0,
            SceneFlags.VOLUMETRIC_LIGHTING,
        );
        pass.addQueue(QueueHint.RENDER_TRANSPARENT).addSceneOfCamera(camera, new LightInfo(),
            SceneFlags.TRANSPARENT_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.GEOMETRY);

        if (!EDITOR) {
            settings.passPathName += pass.name;
            pass.setVersion(settings.passPathName, 0);
        }
    }
}
