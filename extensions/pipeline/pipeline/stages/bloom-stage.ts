
import { BaseStage, } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Vec4, Material, CCString, input, director } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { BloomSetting } from "../components/bloom";
import { passUtils } from "../utils/pass-utils";
import { settings } from "./setting";
import { HrefSetting } from "../settings/href-setting";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

export const MAX_BLOOM_FILTER_PASS_NUM = 6;
export const BLOOM_PREFILTERPASS_INDEX = 0;
export const BLOOM_DOWNSAMPLEPASS_INDEX = 1;
export const BLOOM_UPSAMPLEPASS_INDEX = BLOOM_DOWNSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;
export const BLOOM_COMBINEPASS_INDEX = BLOOM_UPSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;

let defaultSetting = {
    enable: true,
    threshold: 1,
    iterations: 2,
    intensity: 0.2,
    blurRadius: 1
}

const tempVec4 = new Vec4();

let clampSampler = new gfx.Sampler(new gfx.SamplerInfo(
    gfx.Filter.LINEAR, gfx.Filter.LINEAR, undefined,
    gfx.Address.CLAMP, gfx.Address.CLAMP
), 0);

@ccclass('custom.BloomStage')
export class BloomStage extends BaseStage {
    _materialName = 'blit-screen';
    uniqueStage = true;

    @property
    name = 'BloomStage'

    @property({ override: true, type: CCString })
    outputNames = ['BloomPassCombineColor']

    checkEnable () {
        let setting = BloomSetting.instance || defaultSetting;
        return this.enable && setting.enable && !settings.bakingReflection && !!HrefSetting.bloom;
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        passUtils.clearFlag = gfx.ClearFlagBit.NONE;
        // passUtils.clearFlag = gfx.ClearFlagBit.COLOR;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        let material = globalThis.pipelineAssets.getMaterial('bloom')
        passUtils.material = material;

        let setting = BloomSetting.instance || defaultSetting;
        let format = Format.RGBA16F

        const cameraID = getCameraUniqueID(camera);
        const cameraName = `Camera${cameraID}`;
        const area = this.getRenderArea(camera);
        let width = area.width;
        let height = area.height;

        // Start bloom
        // ==== Bloom prefilter ===
        const bloomPassPrefilterRTName = `dsBloomPassPrefilterColor${cameraName}`;

        width >>= 1;
        height >>= 1;

        material.setProperty('texSize', new Vec4(0, 0, setting.threshold, 0), BLOOM_PREFILTERPASS_INDEX);

        let input0 = this.lastStage.slotName(camera, 0)
        passUtils.addRasterPass(width, height, 'bloom-prefilter', `CameraBloomPrefilterPass${cameraID}`)
            .setViewport(area.x, area.y, width, height)
            .setPassInput(input0, 'outputResultMap')
            .addRasterView(bloomPassPrefilterRTName, format)
            .blitScreen(BLOOM_PREFILTERPASS_INDEX)
            .end()

        // === Bloom downSampler ===
        let inputName = bloomPassPrefilterRTName;
        let iterations = setting.iterations;
        let downIndex = 0;
        for (let i = 0; i < iterations; ++i) {
            width >>= 1;
            height >>= 1;

            for (let j = 0; j < 2; j++) {
                let params = new Vec4
                const bloomPassDownSampleRTName = `dsBloomPassDownSampleColor${cameraName}${downIndex}`;
                if (j) {
                    params.set(0, setting.blurRadius / width);
                }
                else {
                    params.set(setting.blurRadius / width, 0);
                }
                material.setProperty('texSize', params, BLOOM_DOWNSAMPLEPASS_INDEX + downIndex);

                let layoutName = `bloom-downsample${downIndex}`
                passUtils.addRasterPass(width, height, layoutName, `CameraBloomDownSamplePass${cameraID}${downIndex}`)
                    .setViewport(area.x, area.y, width, height)
                    .setPassInput(inputName, 'bloomTexture')
                    .addRasterView(bloomPassDownSampleRTName, format)
                    .blitScreen(BLOOM_DOWNSAMPLEPASS_INDEX + downIndex)
                    .end()

                // let setter = (passUtils.pass as any);
                // setter.addConstant('BloomUBO', layoutName);
                // setter.setSampler('bloomTexture', clampSampler)

                inputName = bloomPassDownSampleRTName;
                downIndex++;
            }
        }


        // === Bloom upSampler ===
        for (let i = iterations - 2; i >= 0; --i) {
            width <<= 1;
            height <<= 1;

            material.setProperty('texSize', new Vec4(1, 1, 0, 0), BLOOM_UPSAMPLEPASS_INDEX + i);

            const bloomPassUpSampleRTName = `dsBloomPassUpSampleColor${cameraName}${i}`;
            passUtils.addRasterPass(width, height, `bloom-upsample${i}`, `CameraBloomUpSamplePass${cameraID}${i}`)
                .setViewport(area.x, area.y, width, height)
                .setPassInput(inputName, 'outputResultMap')
                .setPassInput(`dsBloomPassDownSampleColor${cameraName}${i * 2 + 1}`, 'bloomTexture')
                .addRasterView(bloomPassUpSampleRTName, format)
                .blitScreen(BLOOM_UPSAMPLEPASS_INDEX + i)
                .end()

            inputName = bloomPassUpSampleRTName;
        }

        // === Bloom Combine Pass ===
        const slot0 = this.slotName(camera, 0);
        material.setProperty('texSize', new Vec4(setting.intensity, 1, 0, 0), BLOOM_COMBINEPASS_INDEX);

        passUtils.addRasterPass(area.width, area.height, 'bloom-combine', `CameraBloomCombinePass${cameraID}`)
            .setPassInput(input0, 'outputResultMap')
            .setPassInput(inputName, 'bloomTexture')
            .addRasterView(slot0, format)
            .blitScreen(BLOOM_COMBINEPASS_INDEX)
            .end()

    }
}
