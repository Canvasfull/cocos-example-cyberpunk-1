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

@ccclass('ZoomScreenStage')
export class ZoomScreenStage extends BaseStage {
    _materialName = 'zoom-screen';
    materialMap: Map<renderer.scene.Camera, Material> = new Map
    uniqueStage = true;

    @property
    name = 'ZoomScreenStage'

    @property({ override: true, type: CCString })
    outputNames = ['ZoomScreenColor']

    constructor () {
        super();

        if (!EDITOR) {
            input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this)
            input.on(Input.EventType.TOUCH_START, this.onTouchDown, this)
            input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
            input.on(Input.EventType.TOUCH_END, this.onTouchUp, this)
        }

    }


    destroy () {
        if (!EDITOR) {
            input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this)
            input.off(Input.EventType.TOUCH_START, this.onTouchDown, this)
            input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
            input.off(Input.EventType.TOUCH_END, this.onTouchUp, this)
        }
    }

    reset () {
        this.updateMousePosition();
        this.updateScale();
    }

    checkEnable () {
        return super.checkEnable() && !!HrefSetting.zoomScreen;
    }

    _scale = 1;
    _offset = new Vec2
    screenParams = new Vec4

    touchPos = new Vec2

    lastTouchDist = 0;
    pressed = false;
    onTouchDown (event: EventTouch) {
        event.propagationStopped = true;

        // let touches = event.getAllTouches();
        // if (touches.length >= 2) {
        //     let p0 = touches[0].getLocation();
        //     let p1 = touches[1].getLocation();
        //     this.lastTouchDist = Vec2.distance(p0, p1)
        // }

        this.lastTouchDist = 0;
        this.pressed = true;
        this.updateMousePosition(event);
    }
    onTouchMove (event: EventTouch) {

        // let touches = event.getAllTouches();
        // if (touches.length >= 2) {
        //     let p0 = touches[0].getLocation();
        //     let p1 = touches[1].getLocation();
        //     let dist = Vec2.distance(p0, p1)
        //     vec2_temp.set(p0)
        //     vec2_temp.subtract(p1).multiplyScalar(0.5).add(p1);

        //     let dif = dist - this.lastTouchDist
        //     this.lastTouchDist = dist;

        //     this.updateScale(vec2_temp, dif / 100.);
        // }

        event.propagationStopped = true;

        if (this.pressed) {
            this.updateMousePosition(event);

            this._offset.x -= event.getDeltaX() / game.canvas.width * this._scale;
            this._offset.y -= event.getDeltaY() / game.canvas.width * this._scale;
        }
    }
    onTouchUp (event: EventTouch) {
        event.propagationStopped = true;

        this.pressed = false;
    }
    updateMousePosition (event?: EventTouch) {
        let x = 0, y = 0;

        if (event) {
            x = event.getLocationX() / game.canvas!.width;
            y = event.getLocationY() / game.canvas!.height;
        }

        this.touchPos.set(x, y)
    }

    onMouseWheel (event: EventMouse) {
        event.propagationStopped = true;

        if (event) {
            let scrollY = event.getScrollY();

            let scaleOffset = 0.1 * -Math.sign(scrollY) * this._scale;
            this.updateScale(event.getLocation(), scaleOffset);
        }
        else {
            this._scale = 1;
            this._offset.set(0, 0);
        }
    }

    updateScale (center?: Vec2, scaleOffset = 0) {
        if (center) {
            this._scale += scaleOffset;
            this._scale = Math.max(0, this._scale);

            center.x /= game.canvas!.width;
            center.y /= game.canvas!.height;

            this._offset.x -= center.x * scaleOffset;
            this._offset.y -= center.y * scaleOffset;
        }
        else {
            this._scale = 1;
            this._offset.set(0, 0);
        }
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

        material.setProperty('screenParams', this.screenParams.set(this._scale, this._scale, this._offset.x, this._offset.y))

        let pass = material.passes[0];
        pass.bindSampler(pass.getBinding('outputResultMap'), pointSampler);

        passUtils.material = material;

        const input0 = this.lastStage.slotName(camera, 0);
        const slot0 = this.slotName(camera, 0);
        passUtils.addRasterPass(outWidth, outHeight, 'Postprocess', `Camera_DebugScreen_Pass${cameraID}`);

        // let setter = (passUtils.pass as any);
        // setter.setSampler('outputResultMap', director.root.pipeline.globalDSManager.pointSampler);

        passUtils.setViewport(area.x, area.y, outWidth, outHeight)
            .setPassInput(input0, 'outputResultMap')
            .addRasterView(slot0, Format.RGBA16F)
            .blitScreen(0)
            .end()

    }
}
