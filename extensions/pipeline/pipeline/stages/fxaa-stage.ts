import { BaseStage } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString, Vec4, game, Material, input, EventTouch, EventMouse, Vec2, director } from "cc";
import { getCameraUniqueID } from "../utils/utils";
import { passUtils } from "../utils/pass-utils";
import { settings } from "./setting";
import { EDITOR } from "cc/env";
import { HrefSetting } from "../settings/href-setting";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

let pointSampler = new gfx.Sampler(new gfx.SamplerInfo(
    gfx.Filter.POINT, gfx.Filter.POINT
), 0);
(pointSampler as any).custom = true;

@ccclass('FxaaStage')
export class FxaaStage extends BaseStage {
    _materialName = 'fxaa';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    uniqueStage = true;

    @property({ override: true })
    name = 'FxaaStage'

    @property({ override: true })
    outputNames = ['FxaaStageColor']

    checkEnable () {
        return super.checkEnable() && !!HrefSetting.fxaa;
    }

    _offset = new Vec2
    texSize = new Vec4

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const area = this.getRenderArea(camera);
        const width = area.width;
        const height = area.height;

        passUtils.clearFlag = gfx.ClearFlagBit.COLOR;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        let material = this.materialMap.get(camera);
        if (!material || material.parent !== this.material) {
            material = new renderer.MaterialInstance({
                parent: this.material
            })
            this.materialMap.set(camera, material);
        }

        material.setProperty('texSize', this.texSize.set(width, height, 0, 0))

        passUtils.material = material;

        const input0 = this.lastStage.slotName(camera, 0);
        const slot0 = this.slotName(camera, 0);
        passUtils.addRasterPass(width, height, 'post-process', `Camera_Fxaa_Pass${cameraID}`);

        passUtils.setViewport(area.x, area.y, width, height)
            .setPassInput(input0, 'inputTex')
            .addRasterView(slot0, Format.RGBA8)
            .blitScreen(0)
            .version()

    }
}
