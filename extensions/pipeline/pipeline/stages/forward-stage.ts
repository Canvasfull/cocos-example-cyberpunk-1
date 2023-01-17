import { CCString, director, geometry, gfx, pipeline, renderer, rendering, _decorator } from "cc";
import { CameraInfo, getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea, validPunctualLightsCulling } from "../utils/utils";
import { BaseStage } from "./base-stage";

const { supportsR32FloatTexture } = pipeline
const { ShadowType, LightType, SKYBOX_FLAG, CSMLevel } = renderer.scene
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;

const { ccclass, property } = _decorator


@ccclass('custom.ForwardStage')
export class ForwardStage extends BaseStage {
    _materialName = 'blit-screen';

    @property
    name = 'custom.ForwardStage'
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
        // hack: use fog uniform to set forward pipeline
        director.root.pipeline.pipelineSceneData.fog.fogStart = 0;

        const cameraID = getCameraUniqueID(camera);
        const cameraName = `Camera${cameraID}`;

        // const shadowInfo = this.buildShadowPasses(cameraName, camera, ppl);
        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        let isOffScreen = true;//director.root.mainWindow !== camera.window;

        const slot0 = this.slotName(camera, 0);
        const slot1 = this.slotName(camera, 1);
        if (!ppl.containsResource(slot0)) {
            if (!isOffScreen) {
                ppl.addRenderTexture(slot0, Format.RGBA8, width, height, camera.window);
            } else {
                ppl.addRenderTarget(slot0, Format.RGBA16F, width, height, ResourceResidency.MANAGED);
            }
            ppl.addDepthStencil(slot1, Format.DEPTH_STENCIL, width, height, ResourceResidency.MANAGED);
        }

        if (!isOffScreen) {
            ppl.updateRenderWindow(slot0, camera.window);
        } else {
            ppl.updateRenderTarget(slot0, width, height);
            ppl.updateDepthStencil(slot1, width, height);
        }

        const pass = ppl.addRasterPass(width, height, 'default');
        pass.name = `${this.name}_${cameraID}`;
        // pass.setViewport(new Viewport(area.x, area.y, width, height));

        // for (const dirShadowName of shadowInfo.mainLightShadowNames) {
        //     if (ppl.containsResource(dirShadowName)) {
        //         const computeView = new ComputeView();
        //         forwardPass.addComputeView(dirShadowName, computeView);
        //     }
        // }
        // for (const spotShadowName of shadowInfo.spotLightShadowNames) {
        //     if (ppl.containsResource(spotShadowName)) {
        //         const computeView = new ComputeView();
        //         forwardPass.addComputeView(spotShadowName, computeView);
        //     }
        // }

        const passView = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            isOffScreen ? LoadOp.CLEAR : getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.RENDER_TARGET),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(0, 0, 0, 0));
        const passDSView = new RasterView('_',
            AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
            isOffScreen ? LoadOp.CLEAR : getLoadOpOfClearFlag(camera.clearFlag, AttachmentType.DEPTH_STENCIL),
            StoreOp.STORE,
            camera.clearFlag,
            new Color(camera.clearDepth, camera.clearStencil, 0, 0));
        pass.addRasterView(slot0, passView);
        pass.addRasterView(slot1, passDSView);

        pass.addQueue(QueueHint.RENDER_OPAQUE)
            .addSceneOfCamera(camera, new LightInfo(),
                SceneFlags.OPAQUE_OBJECT | SceneFlags.PLANAR_SHADOW | SceneFlags.CUTOUT_OBJECT
                | SceneFlags.DEFAULT_LIGHTING | SceneFlags.DRAW_INSTANCING);
        pass.addQueue(QueueHint.RENDER_TRANSPARENT)
            .addSceneOfCamera(camera, new LightInfo(), SceneFlags.UI | SceneFlags.TRANSPARENT_OBJECT | SceneFlags.GEOMETRY);
    }
}
