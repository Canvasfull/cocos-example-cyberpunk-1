import { gfx, Material, renderer, rendering } from "cc";
import { EDITOR, JSB } from "cc/env";
import { settings } from "../stages/setting";

const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx


class PassUtils {
    clearFlag: gfx.ClearFlagBit = gfx.ClearFlagBit.COLOR;
    clearColor = new gfx.Color()
    ppl: rendering.Pipeline | undefined;
    camera: renderer.scene.Camera | undefined;
    material: Material | undefined;
    pass: rendering.RasterPassBuilder | undefined
    rasterWidth = 0
    rasterHeight = 0
    layoutName = ''

    version () {
        if (!EDITOR) {
            settings.passPathName += `_${this.pass.name}_${this.layoutName}`;
            this.pass.setVersion(settings.passPathName, 0);
        }
    }

    addRasterPass (width: number, height: number, layoutName: string, passName: string) {
        const pass = this.ppl.addRasterPass(width, height, layoutName);
        pass.name = passName;
        this.pass = pass;
        this.rasterWidth = width;
        this.rasterHeight = height;
        this.layoutName = layoutName;
        return this;
    }
    setViewport (x, y, w, h) {
        this.pass.setViewport(new Viewport(x, y, w, h))
        return this;
    }

    addRasterView (name: string, format: gfx.Format, offscreen = true, residency?: rendering.ResourceResidency) {
        if (!this.ppl.containsResource(name)) {
            if (format === gfx.Format.DEPTH_STENCIL) {
                this.ppl.addDepthStencil(name, format, this.rasterWidth, this.rasterHeight, ResourceResidency.MANAGED);
            }
            else {
                if (offscreen) {
                    this.ppl.addRenderTarget(name, format, this.rasterWidth, this.rasterHeight, residency || ResourceResidency.MANAGED);
                }
                else {
                    this.ppl.addRenderTexture(name, format, this.rasterWidth, this.rasterHeight, this.camera.window);
                }
            }

        }

        if (format !== gfx.Format.DEPTH_STENCIL) {
            if (!offscreen) {
                this.ppl.updateRenderWindow(name, this.camera.window);
            }
            else {
                this.ppl.updateRenderTarget(name, this.rasterWidth, this.rasterHeight);
            }
        }

        let clearOp = LoadOp.CLEAR;
        if (this.clearFlag === ClearFlagBit.NONE) {
            // if (JSB) {
            //     clearOp = LoadOp.DISCARD;
            // }
            // else {
            clearOp = LoadOp.LOAD;
            // }
        }

        let view: rendering.RasterView;
        if (format === gfx.Format.DEPTH_STENCIL) {
            view = new RasterView('_',
                AccessType.WRITE, AttachmentType.DEPTH_STENCIL,
                clearOp, StoreOp.STORE,
                gfx.ClearFlagBit.NONE,
                this.clearColor
            );
        }
        else {
            view = new RasterView('_',
                AccessType.WRITE, AttachmentType.RENDER_TARGET,
                clearOp,
                StoreOp.STORE,
                this.clearFlag,
                this.clearColor
            );
        }
        this.pass.addRasterView(name, view);
        return this;
    }
    setPassInput (inputName: string, shaderName: string) {
        if (this.ppl.containsResource(inputName)) {
            const computeView = new ComputeView();
            computeView.name = shaderName;
            this.pass.addComputeView(inputName, computeView);
        }
        return this;
    }

    blitScreen (passIdx = 0) {
        this.pass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(
            this.camera, this.material, passIdx,
            SceneFlags.NONE,
        );
        return this;
    }
}

export let passUtils = new PassUtils;
