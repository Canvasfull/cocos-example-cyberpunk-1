
import { BaseStage, InputType } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, Vec4, Material, CCString, input } from "cc";
import { getCameraUniqueID, getLoadOpOfClearFlag, getRenderArea } from "../utils/utils";
import { PipelineAssets } from "../resources/pipeline-assets";
import { BloomSetting } from "../components/bloom";
import { passUtils } from "../utils/pass-utils";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

export const MAX_BLOOM_FILTER_PASS_NUM = 6;
export const BLOOM_PREFILTERPASS_INDEX = 0;
export const BLOOM_DOWNSAMPLEPASS_INDEX = 1;
export const BLOOM_UPSAMPLEPASS_INDEX = BLOOM_DOWNSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;
export const BLOOM_COMBINEPASS_INDEX = BLOOM_UPSAMPLEPASS_INDEX + MAX_BLOOM_FILTER_PASS_NUM;

class BloomData {
    declare bloomMaterial: Material;
    threshold = 0.1;
    iterations = 2;
    intensity = 0.8;
    private _updateBloomPass () {
        if (!this.bloomMaterial) return;

        const prefilterPass = this.bloomMaterial.passes[BLOOM_PREFILTERPASS_INDEX];
        prefilterPass.beginChangeStatesSilently();
        prefilterPass.tryCompile();
        prefilterPass.endChangeStatesSilently();

        for (let i = 0; i < MAX_BLOOM_FILTER_PASS_NUM; ++i) {
            const downsamplePass = this.bloomMaterial.passes[BLOOM_DOWNSAMPLEPASS_INDEX + i];
            downsamplePass.beginChangeStatesSilently();
            downsamplePass.tryCompile();
            downsamplePass.endChangeStatesSilently();

            const upsamplePass = this.bloomMaterial.passes[BLOOM_UPSAMPLEPASS_INDEX + i];
            upsamplePass.beginChangeStatesSilently();
            upsamplePass.tryCompile();
            upsamplePass.endChangeStatesSilently();
        }

        const combinePass = this.bloomMaterial.passes[BLOOM_COMBINEPASS_INDEX];
        combinePass.beginChangeStatesSilently();
        combinePass.tryCompile();
        combinePass.endChangeStatesSilently();
    }
    private _init () {
        if (this.bloomMaterial) return;
        this.bloomMaterial = new Material();
        this.bloomMaterial._uuid = 'builtin-bloom-material';
        this.bloomMaterial.initialize({ effectName: 'pipeline/bloom' });
        for (let i = 0; i < this.bloomMaterial.passes.length; ++i) {
            this.bloomMaterial.passes[i].tryCompile();
        }
        this._updateBloomPass();
    }
    constructor () {
        this._init();
    }
}
let bloomData: BloomData | null = null;

let defaultSetting = {
    threshold: 1,
    iterations: 2,
    intensity: 0.2,
    blurRadius: 1
}

const tempVec4 = new Vec4();

@ccclass('custom.BloomStage')
export class BloomStage extends BaseStage {
    _name = 'BloomStage'
    _materialName = 'blit-screen';

    uniqueStage = true;

    @property({ override: true, type: CCString })
    outputNames = ['BloomPassCombineColor']

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        passUtils.clearFlag = gfx.ClearFlagBit.NONE;
        // passUtils.clearFlag = gfx.ClearFlagBit.COLOR;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        let material = PipelineAssets.instance.getMaterial('bloom')
        passUtils.material = material;

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

        let input0 = this.lastStage.slotName(camera, 0)
        passUtils.addRasterPass(width, height, 'Bloom_Prefilter', `CameraBloomPrefilterPass${cameraID}`)
            .setViewport(area.x, area.y, width, height)
            .setPassInput(input0, 'outputResultMap')
            .addRasterView(`dsBloomPassPrefilterColor${cameraName}`, format)
            .blitScreen(BLOOM_PREFILTERPASS_INDEX)

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

                passUtils.addRasterPass(width, height, `Bloom_Downsample${downIndex}`, `CameraBloomDownSamplePass${cameraID}${downIndex}`)
                    .setViewport(area.x, area.y, width, height)
                    .setPassInput(inputName, 'bloomTexture')
                    .addRasterView(bloomPassDownSampleRTName, format)
                    .blitScreen(BLOOM_DOWNSAMPLEPASS_INDEX + downIndex)

                inputName = bloomPassDownSampleRTName;
                downIndex++;
            }
        }


        // === Bloom upSampler ===
        // passUtils.clearFlag = gfx.ClearFlagBit.NONE;
        for (let i = iterations - 2; i >= 0; --i) {
            width <<= 1;
            height <<= 1;

            material.setProperty('texSize', new Vec4(1, 1, 0, 0), BLOOM_UPSAMPLEPASS_INDEX + i);

            const bloomPassUpSampleRTName = `dsBloomPassUpSampleColor${cameraName}${i}`;
            passUtils.addRasterPass(width, height, `Bloom_Upsample${i}`, `CameraBloomUpSamplePass${cameraID}${i}`)
                .setViewport(area.x, area.y, width, height)
                .setPassInput(inputName, 'outputResultMap')
                .setPassInput(`dsBloomPassDownSampleColor${cameraName}${i * 2 + 1}`, 'bloomTexture')
                .addRasterView(bloomPassUpSampleRTName, format)
                .blitScreen(BLOOM_UPSAMPLEPASS_INDEX + i);

            inputName = bloomPassUpSampleRTName;
        }

        // passUtils.clearFlag = gfx.ClearFlagBit.COLOR;

        // === Bloom Combine Pass ===
        const slot0 = this.slotName(camera, 0);
        material.setProperty('texSize', new Vec4(setting.intensity, 1, 0, 0), BLOOM_COMBINEPASS_INDEX);

        passUtils.addRasterPass(area.width, area.height, 'Bloom_Combine', `CameraBloomCombinePass${cameraID}`)
            .setPassInput(input0, 'outputResultMap')
            .setPassInput(inputName, 'bloomTexture')
            .addRasterView(slot0, format)
            .blitScreen(BLOOM_COMBINEPASS_INDEX);
    }
}
