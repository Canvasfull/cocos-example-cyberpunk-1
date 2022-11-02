
import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Vec4, Material, CCString } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { PipelineAssets } from "../resources/pipeline-assets";
import { BloomSetting } from "../components/bloom";
import { passUtils } from "../utils/pass-utils";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

export const BLOOM_PREFILTERPASS_INDEX = 0;
export const BLOOM_DOWNSAMPLEPASS_INDEX = 1;
export const BLOOM_UPSAMPLEPASS_INDEX = 2;
export const BLOOM_COMBINEPASS_INDEX = 3;

let defaultSetting = {
    threshold: 1,
    iterations: 2,
    intensity: 0.2,
}

const tempVec4 = new Vec4();


@ccclass('custom.BloomStage')
export class BloomStage extends BaseStage {
    _name = 'BloomStage'
    _materialName = 'blit-screen';

    uniqueStage = true;

    @property({ override: true, type: CCString })
    outputNames = ['BloomPassCombineColor']

    @property
    blurRadius = 0.6


    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        passUtils.clearFlag = camera.clearFlag;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);
        let material = passUtils.material = PipelineAssets.instance.getMaterial('bloom')

        let setting = BloomSetting.instance || defaultSetting;
        let format = Format.RGBA16F

        const cameraID = getCameraUniqueID(camera);
        const cameraName = `Camera${cameraID}`;
        let width = camera.window.width;
        let height = camera.window.height;
        const area = getRenderArea(camera, width, height);
        width = area.width;
        height = area.height;

        // Start bloom
        // ==== Bloom prefilter ===
        const bloomPassPrefilterRTName = `dsBloomPassPrefilterColor${cameraName}`;

        width >>= 1;
        height >>= 1;

        material.setProperty('texSize', new Vec4(0, 0, setting.threshold, 0), BLOOM_PREFILTERPASS_INDEX);

        let pass = passUtils.addRasterPass(width, height, 'Bloom_Prefilter', `CameraBloomPrefilterPass${cameraID}`)
        pass.setViewport(new Viewport(area.x, area.y, width, height));

        let input0 = this.lastStage.slotName(camera, 0)
        passUtils.setPassInput(input0, 'outputResultMap');
        passUtils.addRasterView(`dsBloomPassPrefilterColor${cameraName}`, format);
        passUtils.blitScreen(BLOOM_PREFILTERPASS_INDEX);

        // === Bloom downSampler ===
        let downInputName = bloomPassPrefilterRTName;
        let iterations = setting.iterations;
        for (let i = 0; i < iterations; ++i) {
            width >>= 1;
            height >>= 1;

            for (let j = 0; j < 2; j++) {
                const bloomPassDownSampleRTName = `dsBloomPassDownSampleColor${cameraName}${i}${j}`;
                if (j) {
                    tempVec4.set(0, this.blurRadius / area.width);
                }
                else {
                    tempVec4.set(this.blurRadius / area.width, 0);
                }
                material.setProperty('texSize', tempVec4, BLOOM_DOWNSAMPLEPASS_INDEX);

                let pass = passUtils.addRasterPass(width, height, `Bloom_Downsample${i}`, `CameraBloomDownSamplePass${cameraID}${i}`)
                pass.setViewport(new Viewport(area.x, area.y, width, height));

                passUtils.setPassInput(downInputName, 'bloomTexture')
                passUtils.addRasterView(bloomPassDownSampleRTName, format);
                passUtils.blitScreen(BLOOM_DOWNSAMPLEPASS_INDEX);

                downInputName = bloomPassDownSampleRTName;
            }
        }

        // === Bloom upSampler ===
        for (let i = 0; i < iterations; ++i) {
            const texSize = new Vec4(width, height, 0, 0);
            const bloomPassUpSampleRTName = `dsBloomPassUpSampleColor${cameraName}${i}`;
            width <<= 1;
            height <<= 1;

            material.setProperty('texSize', texSize, BLOOM_UPSAMPLEPASS_INDEX);

            let pass = passUtils.addRasterPass(width, height, `Bloom_Upsample${i}`, `CameraBloomUpSamplePass${cameraID}${iterations - 1 - i}`)
            pass.setViewport(new Viewport(area.x, area.y, width, height));

            passUtils.setPassInput(`dsBloomPassDownSampleColor${cameraName}${i}${1}`, 'bloomTexture');
            passUtils.addRasterView(bloomPassUpSampleRTName, format);
            passUtils.blitScreen(BLOOM_UPSAMPLEPASS_INDEX);
        }

        // === Bloom Combine Pass ===
        const slot0 = this.slotName(camera, 0);

        width = area.width;
        height = area.height;

        material.setProperty('texSize', new Vec4(0, 0, setting.intensity, 1), BLOOM_COMBINEPASS_INDEX);

        passUtils.addRasterPass(width, height, 'Bloom_Combine', `CameraBloomCombinePass${cameraID}`)

        passUtils.setPassInput(input0, 'outputResultMap');
        passUtils.setPassInput(`dsBloomPassUpSampleColor${cameraName}${iterations - 1}`, 'bloomTexture');

        passUtils.addRasterView(slot0, format);
        passUtils.blitScreen(BLOOM_COMBINEPASS_INDEX);
    }
}
