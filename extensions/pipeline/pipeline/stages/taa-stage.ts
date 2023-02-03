import { Camera, game, gfx, Mat4, Material, renderer, rendering, Vec2, Vec4, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { CameraSetting } from "../camera-setting";
import { TAASetting } from "../components/taa";
import { HrefSetting } from "../settings/href-setting";
import { Editor } from "../utils/npm";
import { passUtils } from "../utils/pass-utils";
import { getCameraUniqueID, getRenderArea } from "../utils/utils";
import { BaseStage } from "./base-stage";
import { settings } from "./setting";

const { ccclass, property } = _decorator

let tempVec4 = new Vec4
const slotNames = ['TAA_First', 'TAA_Second']

@ccclass('TAAStage')
export class TAAStage extends BaseStage {
    _materialName = 'deferred-taa';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    prevMatViewProj = new Mat4;

    @property
    name = 'TAAStage'

    checkEnable (): boolean {
        return this.enable &&
            globalThis.TAASetting && globalThis.TAASetting.instance && globalThis.TAASetting.instance.enable &&
            !!HrefSetting.taa;
    }

    slotName (camera: renderer.scene.Camera, index = 0) {
        if (!this.checkEnable()) {
            return this.lastStage.slotName(camera, index);
        }

        let taa = globalThis.TAASetting.instance;

        if (taa.taaTextureIndex < 0) {
            return slotNames[0];
        }

        return slotNames[(taa.taaTextureIndex + 1) % 2];
    }

    // public onResize () {
    //     this.taaTextureIndex = -1;
    //     this.sampleIndex = -1;
    // }

    firstRender = true;
    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        if (!this.checkEnable()) {
            return;
        }
        let taa = globalThis.TAASetting.instance;

        const cameraID = getCameraUniqueID(camera);
        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        passUtils.clearFlag = gfx.ClearFlagBit.COLOR;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        // material
        let material = this.materialMap.get(camera);
        if (!material || material.parent !== this.material) {
            material = new renderer.MaterialInstance({
                parent: this.material
            })
            this.materialMap.set(camera, material);
        }

        passUtils.material = material;

        // material.setProperty('inputViewPort',
        //     new Vec4(
        //         width / game.canvas.width, height / game.canvas.height,
        //         0, 0
        //     )
        // );

        if (this.firstRender) {
            this.prevMatViewProj = camera.matViewProj;
            this.firstRender = false;
        }
        material.setProperty('taaParams1', tempVec4.set(taa.sampleOffset.x, taa.sampleOffset.y, taa.feedback, 0))
        material.setProperty('taaTextureSize', tempVec4.set(1 / width, 1 / height, 1 / width, 1 / height))
        material.setProperty('taaPrevViewProj', this.prevMatViewProj);
        this.prevMatViewProj.set(camera.matViewProj);

        // input output
        let input0 = this.lastStage.slotName(camera, 0);
        let historyTexture = slotNames[taa.taaTextureIndex % 2];

        if (taa.taaTextureIndex < 0) {
            historyTexture = input0;
        }

        let slot0 = this.slotName(camera, 0);

        let depthTex = 'gBufferDS'
        if (settings.gbufferStage) {
            depthTex = settings.gbufferStage.slotName(camera, 4);
        }

        passUtils.addRasterPass(width, height, 'DeferredTAA' + (taa.taaTextureIndex < 0 ? -1 : (taa.taaTextureIndex % 2)), `CameraTAAPass${cameraID}`)
            .setViewport(area.x, area.y, width, height)
            .setPassInput(input0, 'inputTexture')
            .setPassInput(depthTex, 'depthBuffer')
            .setPassInput(historyTexture, 'taaPrevTexture')
            .addRasterView(slot0, gfx.Format.RGBA16F, true, rendering.ResourceResidency.PERSISTENT)
            .blitScreen(0)
            .version()
    }
}

