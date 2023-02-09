import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, pipeline, CCString } from "cc";
import { CameraInfo, getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea, validPunctualLightsCulling } from "../utils/utils";
import { EDITOR } from "cc/env";
import { settings } from "./setting";
import { HrefSetting } from "../settings/href-setting";

const { supportsR32FloatTexture } = pipeline
const { ShadowType, LightType, SKYBOX_FLAG, CSMLevel } = renderer.scene
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;

const { ccclass, property } = _decorator

@ccclass('CustomShadowStage')
export class CustomShadowStage extends BaseStage {
    _materialName = 'blit-screen';

    @property({ override: true })
    name = 'CustomShadowStage'

    @property
    textureFormat = gfx.Format.RGBA8

    mainLightShadows: string[] = []

    buildShadowPass (passName: Readonly<string>,
        ppl: rendering.Pipeline,
        camera: renderer.scene.Camera, light: renderer.scene.Light, level: number,
        width: Readonly<number>, height: Readonly<number>) {
        const device = ppl.device;
        const shadowMapName = passName;
        if (!ppl.containsResource(shadowMapName)) {
            const format = supportsR32FloatTexture(device) ? Format.R32F : Format.RGBA8;
            ppl.addRenderTarget(shadowMapName, format, width, height, ResourceResidency.MANAGED);
            ppl.addDepthStencil(`${shadowMapName}Depth`, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }
        const pass = ppl.addRasterPass(width, height, 'default');
        pass.name = passName;

        pass.addRasterView(shadowMapName, new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            ClearFlagBit.COLOR,
            new Color(1, 1, 1, camera.clearColor.w)));
        pass.addRasterView(`${shadowMapName}Depth`, new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            LoadOp.CLEAR, StoreOp.DISCARD,
            ClearFlagBit.DEPTH_STENCIL,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0)));
        const rect = getRenderArea(new gfx.Rect, camera, width, height, light, level);
        pass.setViewport(new Viewport(rect.x, rect.y, rect.width, rect.height));
        const queue = pass.addQueue(QueueHint.RENDER_OPAQUE);
        queue.addSceneOfCamera(camera, new LightInfo(light, level),
            SceneFlags.SHADOW_CASTER);

        if (!EDITOR) {
            settings.passPathName += passName
            pass.setVersion(settings.passPathName, 0);
        }
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        if (!HrefSetting.shadow) {
            return;
        }

        settings.shadowStage = this;

        // validPunctualLightsCulling(ppl, camera);
        const pipeline = ppl;
        const shadowInfo = pipeline.pipelineSceneData.shadows;
        // const validPunctualLights = ppl.pipelineSceneData.validPunctualLights;
        const shadows = ppl.pipelineSceneData.shadows;
        if (!shadowInfo.enabled || shadowInfo.type !== ShadowType.ShadowMap) {
            return;
        }

        // const _validLights: renderer.scene.Light[] = [];
        // let n = 0;
        // let m = 0;
        // for (; n < shadowInfo.maxReceived && m < validPunctualLights.length;) {
        //     const light = validPunctualLights[m];
        //     if (light.type === LightType.SPOT) {
        //         const spotLight = light as renderer.scene.SpotLight;
        //         if (spotLight.shadowEnabled) {
        //             _validLights.push(light);
        //             n++;
        //         }
        //     }
        //     m++;
        // }

        this.mainLightShadows.length = 0;

        const cameraID = getCameraUniqueID(camera);
        const mainLight = camera.scene.mainLight;

        // build shadow map
        const mapWidth = shadows.size.x;
        const mapHeight = shadows.size.y;
        if (mainLight && mainLight.shadowEnabled) {
            let mainShadowName = `MainLightShadow${cameraID}`
            this.mainLightShadows[0] = mainShadowName;
            if (mainLight.shadowFixedArea) {
                this.buildShadowPass(this.mainLightShadows[0], ppl,
                    camera, mainLight, 0, mapWidth, mapHeight);
            } else {
                const csmLevel = pipeline.pipelineSceneData.csmSupported ? mainLight.csmLevel : 1;
                for (let i = 0; i < csmLevel; i++) {
                    this.mainLightShadows[i] = mainShadowName;
                    this.buildShadowPass(this.mainLightShadows[i], ppl,
                        camera, mainLight, i, mapWidth, mapHeight);
                }
            }
        }

        // for (let l = 0; l < _validLights.length; l++) {
        //     const light = _validLights[l];
        //     const passName = `SpotLightShadow${l.toString()}${cameraName}`;
        //     cameraInfo.spotLightShadowNames[l] = passName;
        //     this.buildShadowPass(passName, ppl,
        //         camera, light, 0, mapWidth, mapHeight);
        // }
    }
}
