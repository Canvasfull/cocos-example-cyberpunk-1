import { gfx, js, Material, path, Vec2 } from 'cc';
import { LGraphNode } from '../@types/litegraph';
import { BaseStage, } from '../../stages/base-stage';
import { BlitStage } from '../../stages/blit-stage';
import { liteGraph } from '../graph';
import { readPixels } from '../../utils/utils';
import { updateNextNodes } from '../utils/nodes';
import { loadResources } from '../../utils/npm';
import { ForwardStage } from '../../stages/forward-stage';
import { DeferredGBufferStage } from '../../stages/deferred-gbuffer-stage';
import { DeferredLightingStage } from '../../stages/deferred-lighting-stage';
import { PipelineAssets } from '../../resources/pipeline-assets';
import { DeferredPostStage } from '../../stages/deferred-post-stage';
import { BloomStage } from '../../stages/bloom-stage';
import { TAAStage } from '../../stages/taa-stage';
import { FSRStage } from '../../stages/fsr-stage';
import { ForwardPostStage } from '../../stages/forward-post-stage';
import { ZoomScreenStage } from '../../stages/zoom-screen-stage';

export function createStageGraph (sclass: typeof BaseStage) {
    let name = js.getClassName(sclass);

    function Stage () {
        let self = this as LGraphNode;

        // input slots
        self.addInput('Camera Output', 'Camera Output');
        self.addInput('RenderTexture', 'RenderTexture');

        self.addInput('Custom Size', 'vec2');

        // output slots
        self.addOutput('RenderTexture', 'RenderTexture');

        let onPropertyChanges: Map<string, Function> = new Map;

        let stage = new sclass();
        this.stage = stage;

        self.addProperty('showResult', false, 'bool');

        function updateSize () {
            let originHeight = self.computeSize()[1];
            self.size[1] = originHeight;
            if (stage.outputTexture) {
                let width = self.size[0];
                let height = width * stage.outputTexture.height / stage.outputTexture.width;

                height *= stage.outputTexture.window.framebuffer.colorTextures.length;

                if (self.properties.showResult) {
                    self.size[1] = originHeight + height + 5;
                }
            }
        }

        onPropertyChanges.set('material', (v: string) => {
        })

        // if (globalThis.pipelineAssets) {
        //     let names = globalThis.pipelineAssets.materialNames;

        //     function setMaterial (effectName: string) {
        //         stage.material = globalThis.pipelineAssets.materialMap.get(effectName)
        //     }

        //     let name = 'material';
        //     let value = this.properties.material || stage.materialName || names[0];

        //     let widget = self.addWidget("combo", name, value, name, { values: names });
        //     self.addProperty(name, widget.value, widget.type);

        //     setMaterial(value);

        //     onPropertyChanges.set('material', (v: string) => {
        //         setMaterial(v);
        //     })

        //     self.addWidget('button', 'show result', null, () => {
        //         self.properties.showResult = !self.properties.showResult;
        //     });
        // }

        let props = (sclass as any).__props__;
        let attrs = (sclass as any).__attrs__;
        props.forEach(p => {
            if (p.startsWith('_')) {
                return;
            }
            if (p === 'inputType' || p === 'renderToScreen') {
                return;
            }

            let value = stage[p];
            let type = attrs[p + '$_$type'];
            let widget
            if (type === 'Enum') {
                let enumList = attrs[p + '$_$enumList'].map((e: any) => e.name);
                self.addWidget("combo", p, enumList[value], p, { values: enumList });

                onPropertyChanges.set(p, (v: string) => {
                    stage[p] = enumList.indexOf(v);
                })
            }
            else if (typeof value === 'string') {
                widget = self.addWidget("text", p, value, p);
            }
            else if (typeof value === 'number') {
                widget = self.addWidget("number", p, value, p);
            }
            else if (typeof value === 'boolean') {
                widget = self.addWidget("toggle", p, value, p);
            }

            if (widget) {
                self.addProperty(p, widget.value, widget.type);
            }
        })

        self.onPropertyChanged = function (name: string, value: string, prevalue: string) {
            let func = onPropertyChanges.get(name);
            if (func) {
                func(value, prevalue);
            }
            else {
                stage[name] = value;
            }
        }

        this.onUpdateStage = function updateStage (prev: LGraphNode, stages: BaseStage[]) {
            stage.renderToScreen = false;
            // stage.outputName = ''

            let isFirst = stages.length === 0
            if (!isFirst) {
                stage.lastStage = (prev as any).stage;
            }

            if (stage.checkEnable()) {
                let customSize = self.getInputData(2);
                if (customSize) {
                    stage.useCustomSize = true;
                    stage.customSize.x = customSize[0];
                    stage.customSize.y = customSize[1];
                }
                else {
                    stage.useCustomSize = false;
                }

                stages.push(stage);
                updateNextNodes(self, stages);
            }
            else {
                updateNextNodes(prev, stages, 0, self.getOutputNodes(0));
            }

        }

        function createDrawFunc (index = 0) {
            let imgData: ImageData;
            let imgCanvas: HTMLCanvasElement;
            let imgCtx: CanvasRenderingContext2D;
            let buffer32f: Float32Array;

            return function draw (ctx: CanvasRenderingContext2D, tex: gfx.Texture) {
                let imgWidth = self.size[0];
                let imgHeight = imgWidth * stage.outputTexture.height / stage.outputTexture.width;

                let width = stage.outputTexture.width;
                let height = stage.outputTexture.height;

                if (!imgData) {
                    imgCanvas = document.createElement('canvas') as HTMLCanvasElement;
                    imgCanvas.width = width;
                    imgCanvas.height = height;

                    imgCtx = imgCanvas.getContext('2d');
                    imgData = imgCtx.getImageData(0, 0, width, height);
                }

                if (tex.format === gfx.Format.R32F) {
                    if (!buffer32f) {
                        buffer32f = new Float32Array(width * height);
                    }

                    readPixels(stage.outputTexture, buffer32f, index);

                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {

                            let dstIdx = (x + y * width) * 4;
                            imgData.data[dstIdx] = buffer32f[x + y * width] * 255;
                            imgData.data[dstIdx + 1] = 0
                            imgData.data[dstIdx + 2] = 0
                            imgData.data[dstIdx + 3] = 255
                        }
                    }
                }
                else if (tex.format === gfx.Format.RGBA32F) {
                    if (!buffer32f) {
                        buffer32f = new Float32Array(width * height * 4);
                    }

                    readPixels(stage.outputTexture, buffer32f, index);

                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {

                            let dstIdx = (x + y * width) * 4;
                            imgData.data[dstIdx] = buffer32f[dstIdx] * 255;
                            imgData.data[dstIdx + 1] = buffer32f[dstIdx + 1] * 255
                            imgData.data[dstIdx + 2] = buffer32f[dstIdx + 2] * 255
                            imgData.data[dstIdx + 3] = buffer32f[dstIdx + 3] * 255
                        }
                    }
                }
                else {
                    readPixels(stage.outputTexture, imgData.data as any, index);
                }

                imgCtx.putImageData(imgData, 0, 0);

                let colorTextures = stage.outputTexture.window.framebuffer.colorTextures;

                ctx.save();
                ctx.scale(1, -1);
                ctx.drawImage(imgCanvas, 0, 0, width, height, 0, -self.size[1] + imgHeight * (colorTextures.length - 1 - index), imgWidth, imgHeight);
                ctx.restore();
            }
        }

        self.onDrawBackground = (ctx, canvas) => {
            updateSize()

            if (self.properties.showResult && stage.outputTexture) {
                let colorTextures = stage.outputTexture.window.framebuffer.colorTextures;

                for (let i = 0; i < colorTextures.length; i++) {
                    let funcName = 'draw_color_' + i;
                    if (!self[funcName]) {
                        self[funcName] = createDrawFunc(i);
                    }

                    self[funcName](ctx, colorTextures[i]);
                }
            }
        }

        self.onRemoved = () => {
            stage.destroy();
        }

        self.size = self.computeSize();
    }
    Stage.title = name;

    delete liteGraph.registered_node_types[`pipeline/${name}`];
    liteGraph.registerNodeType(`pipeline/${name}`, Stage as any);
}


createStageGraph(BaseStage);
createStageGraph(BlitStage);
createStageGraph(ForwardStage);
createStageGraph(ForwardPostStage);
createStageGraph(DeferredGBufferStage);
createStageGraph(DeferredLightingStage);
createStageGraph(DeferredPostStage);
createStageGraph(BloomStage);
createStageGraph(TAAStage);
createStageGraph(FSRStage);
createStageGraph(ZoomScreenStage);
