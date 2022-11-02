import { CCString, geometry, gfx, pipeline, renderer, rendering, _decorator } from "cc";
import { CameraInfo, getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea, validPunctualLightsCulling } from "../utils/utils";
import { BaseStage } from "./base-stage";

const { supportsR32FloatTexture } = pipeline
const { ShadowType, LightType, SKYBOX_FLAG, CSMLevel } = renderer.scene
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;

const { ccclass, property } = _decorator


@ccclass('custom.ForwardStage')
export class ForwardStage extends BaseStage {
    _name = 'ForwardStage'
    _materialName = 'blit-screen';

    @property({ override: true, type: CCString })
    outputNames = ['ForwardColor', 'ForwardDepth']

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
        const pass = ppl.addRasterPass(width, height, 'default', passName);
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
        const rect = getRenderArea(camera, width, height, light, level);
        pass.setViewport(new Viewport(rect.x, rect.y, rect.width, rect.height));
        const queue = pass.addQueue(QueueHint.RENDER_OPAQUE);
        queue.addSceneOfCamera(camera, new LightInfo(light, level),
            SceneFlags.SHADOW_CASTER);
    }

    buildShadowPasses (cameraName: string, camera: renderer.scene.Camera, ppl: rendering.Pipeline) {
        validPunctualLightsCulling(ppl, camera);
        const pipeline = ppl;
        const shadowInfo = pipeline.pipelineSceneData.shadows;
        const validPunctualLights = ppl.pipelineSceneData.validPunctualLights;
        const cameraInfo = new CameraInfo();
        const shadows = ppl.pipelineSceneData.shadows;
        if (!shadowInfo.enabled || shadowInfo.type !== ShadowType.ShadowMap) { return cameraInfo; }
        cameraInfo.shadowEnabled = true;
        const _validLights: renderer.scene.Light[] = [];
        let n = 0;
        let m = 0;
        for (; n < shadowInfo.maxReceived && m < validPunctualLights.length;) {
            const light = validPunctualLights[m];
            if (light.type === LightType.SPOT) {
                const spotLight = light as renderer.scene.SpotLight;
                if (spotLight.shadowEnabled) {
                    _validLights.push(light);
                    n++;
                }
            }
            m++;
        }

        const { mainLight } = camera.scene!;
        // build shadow map
        const mapWidth = shadows.size.x;
        const mapHeight = shadows.size.y;
        if (mainLight && mainLight.shadowEnabled) {
            cameraInfo.mainLightShadowNames[0] = `MainLightShadow${cameraName}`;
            if (mainLight.shadowFixedArea) {
                this.buildShadowPass(cameraInfo.mainLightShadowNames[0], ppl,
                    camera, mainLight, 0, mapWidth, mapHeight);
            } else {
                const csmLevel = pipeline.pipelineSceneData.csmSupported ? mainLight.csmLevel : 1;
                for (let i = 0; i < csmLevel; i++) {
                    cameraInfo.mainLightShadowNames[i] = `MainLightShadow${cameraName}`;
                    this.buildShadowPass(cameraInfo.mainLightShadowNames[i], ppl,
                        camera, mainLight, i, mapWidth, mapHeight);
                }
            }
        }

        for (let l = 0; l < _validLights.length; l++) {
            const light = _validLights[l];
            const passName = `SpotLightShadow${l.toString()}${cameraName}`;
            cameraInfo.spotLightShadowNames[l] = passName;
            this.buildShadowPass(passName, ppl,
                camera, light, 0, mapWidth, mapHeight);
        }
        return cameraInfo;
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const cameraName = `Camera${cameraID}`;

        const cameraInfo = this.buildShadowPasses(cameraName, camera, ppl);
        const width = camera.window.width;
        const height = camera.window.height;

        let isOffScreen = !this.renderToScreen;

        const forwardPassRTName = this.slotName(camera, 0);
        const forwardPassDSName = this.slotName(camera, 1);
        if (!ppl.containsResource(forwardPassRTName)) {
            if (!isOffScreen) {
                ppl.addRenderTexture(forwardPassRTName, Format.RGBA8, width, height, camera.window);
            } else {
                ppl.addRenderTarget(forwardPassRTName, Format.RGBA16F, width, height, ResourceResidency.MANAGED);
            }
            ppl.addDepthStencil(forwardPassDSName, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }

        const forwardPass = ppl.addRasterPass(width, height, 'default', `${this._name}_${cameraID}`);
        for (const dirShadowName of cameraInfo.mainLightShadowNames) {
            if (ppl.containsResource(dirShadowName)) {
                const computeView = new ComputeView();
                forwardPass.addComputeView(dirShadowName, computeView);
            }
        }
        for (const spotShadowName of cameraInfo.spotLightShadowNames) {
            if (ppl.containsResource(spotShadowName)) {
                const computeView = new ComputeView();
                forwardPass.addComputeView(spotShadowName, computeView);
            }
        }

        const passView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            isOffScreen ? LoadOp.CLEAR : getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.RENDER_TARGET),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearColor.x, camera.clearColor.y, camera.clearColor.z, camera.clearColor.w));
        const passDSView = new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            isOffScreen ? LoadOp.CLEAR : getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.DEPTH_STENCIL),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        forwardPass.addRasterView(forwardPassRTName, passView);
        forwardPass.addRasterView(forwardPassDSName, passDSView);

        forwardPass
            .addQueue(QueueHint.RENDER_OPAQUE)
            .addSceneOfCamera(camera, new LightInfo(),
                SceneFlags.OPAQUE_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.CUTOUT_OBJECT
                | SceneFlags.DEFAULT_LIGHTING | SceneFlags.DRAW_INSTANCING);
        // forwardPass
        //     .addQueue(QueueHint.RENDER_TRANSPARENT)
        //     .addSceneOfCamera(camera, new LightInfo(), SceneFlags.TRANSPARENT_OBJECT | SceneFlags.GEOMETRY);

        if (!isOffScreen) {
            forwardPass
                .addQueue(QueueHint.RENDER_TRANSPARENT)
                .addSceneOfCamera(camera, new LightInfo(), SceneFlags.UI | SceneFlags.PROFILER);
        }
    }
}
