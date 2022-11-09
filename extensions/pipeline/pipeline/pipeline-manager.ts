import { _decorator, renderer, rendering, ReflectionProbeManager } from 'cc';
import { BaseStage } from './stages/base-stage';
import { CameraSetting } from './camera-setting';
import { EDITOR } from 'cc/env';
import { buildDeferred } from './test-custom';
import { passUtils } from './utils/pass-utils';
import { settings } from './stages/setting';

let EditorCameras = [
    'scene:material-previewcamera',
    'Scene Gizmo Camera',
    'Editor UIGizmoCamera',

    // 'Main Camera'
]

export class CustomPipelineBuilder {
    static pipelines: Map<string, BaseStage[]> = new Map

    static registerStages (name: string, stages: BaseStage[]) {
        this.pipelines.set(name, stages);
    }

    static unregisterStages (name: string) {
        this.pipelines.set(name, null);
    }

    public setup (cameras: renderer.scene.Camera[], ppl: rendering.Pipeline): void {

        // if (EDITOR) {
        //     excludes.push('Main Camera')
        // }

        passUtils.ppl = ppl;

        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!camera.scene) {
                continue;
            }
            // buildDeferred(camera, ppl);

            passUtils.camera = camera;

            if (camera.cameraType === renderer.scene.CameraType.REFLECTION_PROBE) {
                const probe = ReflectionProbeManager.probeManager.getProbeByCamera(camera);
                if (probe && probe.needRender) {
                    if (probe.probeType === 0) {
                        settings.OUTPUT_RGBE = true;

                        let originName = camera.name;
                        for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
                            //update camera dirction
                            probe.updateCameraDir(faceIdx);
                            const renderTexture = probe.bakedCubeTextures[faceIdx];
                            probe.setTargetTexture(renderTexture);
                            // probeStage.setUsageInfo(probe, renderTexture.window!.framebuffer);
                            // probeStage.render(probe.camera);

                            camera._name = originName + faceIdx;

                            this.renderCamera(camera, ppl, true)
                        }

                        camera._name = originName;
                        probe.setTargetTexture(null);

                        settings.OUTPUT_RGBE = false;
                    }
                }
            }
            else {
                this.renderCamera(camera, ppl)
            }

        }
    }
    renderCamera (camera: renderer.scene.Camera, ppl: rendering.Pipeline, forceMain = false) {
        // const isGameView = camera.cameraUsage === renderer.scene.CameraUsage.GAME
        // || camera.cameraUsage === renderer.scene.CameraUsage.GAME_VIEW;

        let cameraSetting = camera.node.getComponent(CameraSetting);

        let pipelineName = 'main';
        if (forceMain) { }
        else if (EDITOR) {
            if (EditorCameras.includes(camera.name)) {
                pipelineName = 'editor';
            }
            else if (camera.name !== 'Editor Camera' && camera.name !== 'PrivatePreview') {
                return;
            }
        }
        else if (cameraSetting) {
            pipelineName = cameraSetting.pipeline;
        }

        let stages = CustomPipelineBuilder.pipelines.get(pipelineName);

        for (let i = 0; i < stages.length; i++) {
            stages[i].render(camera, ppl);
        }
    }
}

// if (!EDITOR) {
rendering.setCustomPipeline('Deferred', new CustomPipelineBuilder)
// }
