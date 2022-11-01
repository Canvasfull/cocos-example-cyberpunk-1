
import { _decorator, Component, RenderTexture, game, gfx, Camera, ccenum, director } from 'cc';
import { InPlayMode } from './utils/npm';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('CameraSetting')
@executeInEditMode
export class CameraSetting extends Component {
    static main: CameraSetting | undefined;
    static get mainCamera (): Camera | null {
        if (!InPlayMode) {
            return globalThis.cce.Camera._camera;
        }
        if (this.main) {
            return this.main.camera;
        }
        return null;
    }

    mainRT: RenderTexture | undefined;

    camera: Camera | undefined;

    @property
    isMainCamera = true;

    @property
    pipeline = 'main'

    autoResize = true;

    get depthTexture () {
        return this.mainRT && this.mainRT.window.framebuffer.depthStencilTexture;
    }
    get colorTexture () {
        return this.mainRT && this.mainRT.window.framebuffer.colorTextures[0];
    }

    onEnable () {
        this.check();
    }

    check () {
        if (this.isMainCamera) {
            CameraSetting.main = this;
        }

        this.camera = this.getComponent(Camera) || this.camera;

        if (this.camera && !this.mainRT) {
            const depthStencilAttachment = new gfx.DepthStencilAttachment();
            depthStencilAttachment.format = gfx.Format.DEPTH;
            depthStencilAttachment.depthLoadOp = gfx.LoadOp.LOAD;
            depthStencilAttachment.depthStoreOp = gfx.StoreOp.STORE;
            depthStencilAttachment.stencilLoadOp = gfx.LoadOp.LOAD;
            depthStencilAttachment.stencilStoreOp = gfx.StoreOp.STORE;

            let rt = new RenderTexture();
            rt.reset({
                width: game.canvas.width * director.root.pipeline.pipelineSceneData.shadingScale,
                height: game.canvas.height * director.root.pipeline.pipelineSceneData.shadingScale,
                passInfo: new gfx.RenderPassInfo(
                    [new gfx.ColorAttachment(gfx.Format.RGBA8)],
                    depthStencilAttachment
                )
            });
            this.mainRT = rt;
            this.camera.targetTexture = this.mainRT = rt;
        }
    }

    onDisable () {
        if (CameraSetting.main !== this) {
            CameraSetting.main = undefined;
        }
    }

    onDestroy () {
        if (this.mainRT) {
            this.mainRT.destroy();
        }
    }

    update () {
        let rt = this.mainRT;
        let targetWidth = Math.floor(game.canvas.width * director.root.pipeline.pipelineSceneData.shadingScale);
        let targetHeight = Math.floor(game.canvas.height * director.root.pipeline.pipelineSceneData.shadingScale);

        if (this.autoResize && rt && (
            rt.width !== targetWidth ||
            rt.height !== targetHeight
        )) {
            rt.resize(targetWidth, targetHeight);
        }

        if (rt.window !== this.camera.camera.window) {
            (this.camera as any)._updateTargetTexture()
        }
    }
}
