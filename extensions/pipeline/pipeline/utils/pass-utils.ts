import { gfx, Material, renderer, rendering } from "cc";

const { RasterView, AttachmentType, AccessType, ResourceResidency, LightInfo, SceneFlags, QueueHint, ComputeView } = rendering;
const { Format, LoadOp, StoreOp, ClearFlagBit, Color, Viewport } = gfx

class PassUtils {
    clearFlag = gfx.ClearFlagBit.COLOR;
    clearColor = new gfx.Color()
    ppl: rendering.Pipeline | undefined;
    camera: renderer.scene.Camera | undefined;
    material: Material | undefined;
    pass: rendering.RasterPassBuilder | undefined
    rasterWidth = 0
    rasterHeight = 0

    addRasterPass (width: number, height: number, layoutName: string, passName: string) {
        const pass = this.ppl.addRasterPass(width, height, layoutName);
        pass.name = passName;
        this.pass = pass;
        this.rasterWidth = width;
        this.rasterHeight = height;
        return pass;
    }
    addRasterView (name: string, format: gfx.Format, residency = ResourceResidency.MANAGED) {
        if (!this.ppl.containsResource(name)) {
            this.ppl.addRenderTarget(name, format, this.rasterWidth, this.rasterHeight, residency);
        }

        const view = new RasterView('_',
            AccessType.WRITE, AttachmentType.RENDER_TARGET,
            LoadOp.CLEAR, StoreOp.STORE,
            this.clearFlag,
            this.clearColor);
        this.pass.addRasterView(name, view);

    }
    setPassInput (inputName: string, shaderName: string) {
        if (this.ppl.containsResource(inputName)) {
            const computeView = new ComputeView();
            computeView.name = shaderName;
            this.pass.addComputeView(inputName, computeView);
        }
    }

    blitScreen (passIdx = 0) {
        this.pass.addQueue(QueueHint.RENDER_TRANSPARENT).addCameraQuad(
            this.camera, this.material, passIdx,
            SceneFlags.NONE,
        );
    }
}

export let passUtils = new PassUtils;
