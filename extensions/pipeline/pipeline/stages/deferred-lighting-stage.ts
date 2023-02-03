
import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Material, CCString, Vec4, game, director, ReflectionProbe, TextureCube } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { EDITOR, JSB } from "cc/env";
import { ExponentialHeightFog, fogUBO } from "../components/fog/height-fog";
import { ReflectionProbes } from "../components/reflection-probe-utils";
import { DeferredGBufferStage } from "./deferred-gbuffer-stage";
import { settings } from "./setting";
import { CustomShadowStage } from "./shadow-stage";
import { LightWorldCluster } from "../components/cluster/light-cluster";
import { passUtils } from "../utils/pass-utils";
import { HrefSetting } from "../settings/href-setting";

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

    enableClusterLighting = 0;
    enableIBL = 0;
    enableShadow = 0;

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

        // if (EDITOR) {
        //     material.setProperty('light_cluster_InfoTexture', cluster.dataInfoTextureFloat)
        //     material.setProperty('light_cluster_Texture', cluster.clusterTexture)

        //     let pass = material.passes[0];
        //     let pointSampler = director.root.pipeline.globalDSManager.pointSampler
        //     let binding = pass.getBinding('light_cluster_InfoTexture')
        //     pass.bindSampler(binding, pointSampler)
        //     binding = pass.getBinding('light_cluster_Texture')
        //     pass.bindSampler(binding, pointSampler)
        // }
        // else {
        setter.setTexture('light_cluster_InfoTexture', cluster.dataInfoTextureFloat);
        setter.setTexture('light_cluster_Texture', cluster.clusterTexture);

        let pointSampler = director.root.pipeline.globalDSManager.pointSampler
        setter.setSampler('light_cluster_InfoTexture', pointSampler)
        setter.setSampler('light_cluster_Texture', pointSampler)
        // }
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        // const cameraName = `Camera${cameraID}`;
        // const cameraInfo = buildShadowPasses(cameraName, camera, ppl);
        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        const slot0 = this.slotName(camera, 0);
        let slot1 = this.slotName(camera, 1);
        if (settings.gbufferStage) {
            slot1 = settings.gbufferStage.slotName(camera, 4);
        }

        // passUtils.clearFlag = gfx.ClearFlagBit.NONE;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);
        passUtils.clearFlag = gfx.ClearFlagBit.COLOR;
        passUtils.addRasterPass(width, height, 'deferred-lighting', `LightingShader${cameraID}`)
            .setViewport(area.x, area.y, width, height)
            .setPassInput(this.lastStage.slotName(camera, 0), 'gbuffer_albedoMap')
            .setPassInput(this.lastStage.slotName(camera, 1), 'gbuffer_normalMap')
            .setPassInput(this.lastStage.slotName(camera, 2), 'gbuffer_emissiveMap')
            .setPassInput(this.lastStage.slotName(camera, 3), 'gbuffer_posMap');

        let setter = passUtils.pass as any;
        let shadowStage: CustomShadowStage = settings.shadowStage;
        if (shadowStage) {
            for (const dirShadowName of shadowStage.mainLightShadows) {
                passUtils.setPassInput(dirShadowName, 'cc_shadowMap');
            }

            // not work, will override by queue data
            // let frameBuffer = ppl.pipelineSceneData.shadowFrameBufferMap.get(camera.scene.mainLight);
            // if (frameBuffer) {
            //     setter.setTexture('cc_shadowMap', frameBuffer.colorTextures[0])

            //     let pointSampler = director.root.pipeline.globalDSManager.pointSampler
            //     setter.setSampler('cc_shadowMap', pointSampler)
            // }
        }

        passUtils
            .addRasterView(slot0, Format.RGBA16F, true)
            // .addRasterView(slot1, Format.DEPTH_STENCIL, true)
            .version()

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
                    REFLECTION_PROBE_COUNT: probes.length,
                    ENABLE_CLUSTER_LIGHTING: HrefSetting.clusterLighting,
                    ENABLE_IBL: HrefSetting.ibl,
                    ENABLE_SHADOW: HrefSetting.shadow,
                })

                this.enableClusterLighting = HrefSetting.clusterLighting
                this.enableIBL = HrefSetting.ibl
                this.enableShadow = HrefSetting.shadow
            }
            this.materialMap.set(camera, material);
        }

        if (probes.length !== this.probes.length ||
            this.enableClusterLighting !== HrefSetting.clusterLighting ||
            this.enableIBL !== HrefSetting.ibl ||
            this.enableShadow !== HrefSetting.shadow) {
            material.recompileShaders({
                REFLECTION_PROBE_COUNT: probes.length,
                ENABLE_CLUSTER_LIGHTING: HrefSetting.clusterLighting,
                ENABLE_IBL: HrefSetting.ibl,
                ENABLE_SHADOW: HrefSetting.shadow,
            })
            this.enableClusterLighting = HrefSetting.clusterLighting
            this.enableIBL = HrefSetting.ibl
            this.enableShadow = HrefSetting.shadow
        }

        if (!JSB) {
            setter.addConstant('CustomLightingUBO', 'deferred-lighting');
        }
        for (let i = 0; i < 3; i++) {
            let probe = probes[i];
            if (!probe) break;

            let pos = probe.node.worldPosition;
            let range = Math.max(probe.size.x, probe.size.y, probe.size.z)

            material.setProperty('light_ibl_posRange' + i, tempVec4.set(pos.x, pos.y, pos.z, range))
            let cubemap: TextureCube = (probe as any)._cubemap
            // if (EDITOR) {
            //     material.setProperty('light_ibl_Texture' + i, cubemap)
            // }
            // else {
            setter.setTexture('light_ibl_Texture' + i, cubemap.getGFXTexture())
            setter.setSampler('light_ibl_Texture' + i, cubemap.getGFXSampler())
            // }
        }

        this.probes = probes;

        this.updateClusterUBO(setter, material);

        fogUBO.update(material);

        passUtils.pass
            .addQueue(QueueHint.RENDER_TRANSPARENT)
            .addCameraQuad(
                camera, material, 0,
                SceneFlags.VOLUMETRIC_LIGHTING,
            );

        // render transparent
        // todo: remove this pass
        if (HrefSetting.transparent) {
            passUtils.clearFlag = gfx.ClearFlagBit.NONE;
            passUtils.addRasterPass(width, height, 'default', `LightingTransparent${cameraID}`)
                .setViewport(area.x, area.y, width, height)
                .addRasterView(slot0, Format.RGBA16F, true)
                .addRasterView(slot1, Format.DEPTH_STENCIL, true)
                .version()

            passUtils.pass
                .addQueue(QueueHint.RENDER_TRANSPARENT)
                .addSceneOfCamera(
                    camera, new LightInfo(),
                    SceneFlags.TRANSPARENT_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.GEOMETRY
                )
        }
    }
}
