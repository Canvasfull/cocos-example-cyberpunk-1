import { BaseStage } from "./base-stage";
import { _decorator, renderer, gfx, builtinResMgr, Input, rendering, CCString, Vec4, game, Material } from "cc";
import { getCameraUniqueID } from "../utils/utils";
import { passUtils } from "../utils/pass-utils";
import { settings } from "./setting";

const { type, property, ccclass } = _decorator;
const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

@ccclass('FSRStage')
export class FSRStage extends BaseStage {
    _materialName = 'fsr';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    uniqueStage = true;

    @property
    name = 'FSRStage'

    @property
    sharpness = 0.2

    @property({ override: true, type: CCString })
    outputNames = ['FSRColor']

    checkEnable () {
        return this.enable && this.finalShadingScale() < 1
    }

    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const area = this.getRenderArea(camera);
        const inputWidth = area.width;
        const inputHeight = area.height;

        let shadingScale = this.finalShadingScale()
        const outWidth = Math.floor(inputWidth / shadingScale);
        const outHeight = Math.floor(inputHeight / shadingScale);

        passUtils.clearFlag = gfx.ClearFlagBit.COLOR;
        Vec4.set(passUtils.clearColor, 0, 0, 0, 1);

        let material = this.materialMap.get(camera);
        if (!material || material.parent !== this.material) {
            material = new renderer.MaterialInstance({
                parent: this.material
            })
            this.materialMap.set(camera, material);
        }

        passUtils.material = material;

        material.setProperty('fsrParams', new Vec4(this.sharpness, 0, 0, 0))
        material.setProperty('texSize',
            new Vec4(
                inputWidth, inputHeight,
                outWidth, outHeight
            )
        );


        const input0 = this.lastStage.slotName(camera, 0);
        const easu = 'FSR_EASU'
        passUtils.addRasterPass(outWidth, outHeight, 'Postprocess', `CameraFSR_EASU_Pass${cameraID}`)
            .setViewport(area.x, area.y, outWidth, outHeight)
            .setPassInput(input0, 'outputResultMap')
            .addRasterView(easu, Format.RGBA8)
            .blitScreen(0);

        const slot0 = this.slotName(camera, 0);
        passUtils.addRasterPass(outWidth, outHeight, 'Postprocess', `CameraFSR_RCAS_Pass${cameraID}`)
            .setViewport(area.x, area.y, outWidth, outHeight)
            .setPassInput(easu, 'outputResultMap')
            .addRasterView(slot0, Format.RGBA8)
            .blitScreen(1);

        settings.tonemapped = true;
    }
}
