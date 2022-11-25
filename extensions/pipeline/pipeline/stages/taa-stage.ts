import { game, gfx, Mat4, Material, renderer, rendering, settings, Vec2, Vec4, _decorator } from "cc";
import { passUtils } from "../utils/pass-utils";
import { getCameraUniqueID, getRenderArea } from "../utils/utils";
import { BaseStage } from "./base-stage";

const { ccclass, property } = _decorator


let halton8 = [
    new Vec2(0.5, 1.0 / 3),
    new Vec2(0.25, 2.0 / 3),
    new Vec2(0.75, 1.0 / 9),
    new Vec2(0.125, 4.0 / 9),
    new Vec2(0.625, 7.0 / 9),
    new Vec2(0.375, 2.0 / 9),
    new Vec2(0.875, 5.0 / 9),
    new Vec2(0.0625, 8.0 / 9),
]
halton8.forEach(v => {
    v.x -= 0.5;
    v.y -= 0.5;
})

let SampleOffsets = {
    // 2xMSAA
    // Pattern docs: http://msdn.microsoft.com/en-us/library/windows/desktop/ff476218(v=vs.85).aspx
    //   N.
    //   .S
    x2: [
        new Vec2(-4.0 / 16.0, -4.0 / 16.0),
        new Vec2(4.0 / 16.0, 4.0 / 16.0),
    ],

    // 3xMSAA
    //   A..
    //   ..B
    //   .C.
    // Rolling circle pattern (A,B,C).
    x3: [
        new Vec2(-2.0 / 3.0, -2.0 / 3.0),
        new Vec2(2 / 3, 0 / 3),
        new Vec2(0 / 3, 2 / 3),
    ],

    // 4xMSAA
    // Pattern docs: http://msdn.microsoft.com/en-us/library/windows/desktop/ff476218(v=vs.85).aspx
    //   .N..
    //   ...E
    //   W...
    //   ..S.
    // Rolling circle pattern (N,E,S,W).
    x4: [
        new Vec2(-2 / 16, -6 / 16),
        new Vec2(6 / 16, -2 / 16),
        new Vec2(2 / 16, 6 / 16),
        new Vec2(-6 / 16, 2 / 16),
    ],

    x5: [
        // Compressed 4 sample pattern on same vertical and horizontal line (less temporal flicker).
        // Compressed 1/2 works better than correct 2/3 (reduced temporal flicker).
        //   . N .
        //   W . E
        //   . S .
        // Rolling circle pattern (N,E,S,W).
        new Vec2(0 / 2, -1 / 2),
        new Vec2(1 / 2, 0 / 2),
        new Vec2(0 / 2, 1 / 2),
        new Vec2(-1 / 2, 0 / 2),
    ],

    halton8,
}

const slotNames = ['TAA_First', 'TAA_Second']

@ccclass('TAAStage')
export class TAAStage extends BaseStage {
    _name = 'TAAStage'
    _materialName = 'deferred-taa';
    materialMap: Map<renderer.scene.Camera, Material> = new Map

    @property
    sampleScale = 1;
    @property
    feedback = 0.95;

    @property
    shaowHistoryTexture = false;
    @property
    clampHistoryTexture = true;

    @property
    forceRender = true;
    @property
    dirty = false;

    prevMatViewProj = new Mat4;
    sampleOffset = new Vec2;

    private taaTextureIndex = -1;
    private samples = SampleOffsets.x4;
    private sampleIndex = -1;

    slotName (camera: renderer.scene.Camera, index = 0) {
        let first = slotNames[this.taaTextureIndex % 2];
        let second = slotNames[(this.taaTextureIndex + 1) % 2];

        return `${second}_${this._id}_${getCameraUniqueID(camera)}`
    }


    updateSample (width, height) {
        if (this.dirty || this.forceRender) {
            this.sampleIndex++;
            this.taaTextureIndex++;
            this.dirty = false;
        }

        let offset = this.samples[this.sampleIndex % this.samples.length];

        if (this.sampleIndex === -1) {
            offset = Vec2.ZERO;
        }

        this.sampleOffset.x = offset.x * this.sampleScale / width;
        this.sampleOffset.y = offset.y * this.sampleScale / height;
    }

    public onResize () {
        this.taaTextureIndex = -1;
        this.sampleIndex = -1;
    }


    public render (camera: renderer.scene.Camera, ppl: rendering.Pipeline): void {
        const cameraID = getCameraUniqueID(camera);
        const area = getRenderArea(camera, camera.window.width, camera.window.height);
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

        material.setProperty('inputViewPort',
            new Vec4(
                width / game.canvas.width, height / game.canvas.height,
                0, 0
            )
        );

        // input output
        let input0 = this.lastStage.slotName(camera, 0);
        let first = slotNames[this.taaTextureIndex % 2];

        let historyTexture;
        if (this.taaTextureIndex === -1) {
            historyTexture = input0;
        }
        else {
            historyTexture = first;
        }

        let slot0 = this.slotName(camera, 0);

        passUtils.addRasterPass(width, height, 'DeferredTAA', `CameraTAAPass${cameraID}`)
            .setViewport(area.x, area.y, width, height)
            .setPassInput(input0, 'inputTexture')
            .setPassInput('gBufferDS', 'depthBuffer')
            .setPassInput(historyTexture, 'taaPrevTexture')
            .addRasterView(slot0, gfx.Format.RGBA16F)
            .blitScreen(0)
    }
}

