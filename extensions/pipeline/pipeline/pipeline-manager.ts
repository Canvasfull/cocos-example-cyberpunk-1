import { _decorator, renderer, rendering } from 'cc';
import { BaseStage } from './stages/base-stage';
import { CameraSetting } from './camera-setting';
import { EDITOR } from 'cc/env';

export class CustomPipelineBuilder {
    static pipelines: Map<string, BaseStage[]> = new Map

    static registerStages (name: string, stages: BaseStage[]) {
        this.pipelines.set(name, stages);
    }

    static unregisterStages (name: string) {
        this.pipelines.set(name, null);
    }

    public setup (cameras: renderer.scene.Camera[], ppl: rendering.Pipeline): void {
        let excludes = [
            'scene:material-previewcamera',
            'Scene Gizmo Camera',
            'Editor UIGizmoCamera'
        ]
        if (EDITOR) {
            excludes.push('Main Camera')
        }
        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (camera.scene === null) {
                continue;
            }
            if (excludes.includes(camera.name)) {
                continue;
            }
            this.renderCamera(camera, ppl)
        }
    }
    renderCamera (camera: renderer.scene.Camera, ppl: rendering.Pipeline) {
        // const isGameView = camera.cameraUsage === renderer.scene.CameraUsage.GAME
        // || camera.cameraUsage === renderer.scene.CameraUsage.GAME_VIEW;

        let cameraSetting = camera.node.getComponent(CameraSetting);

        let pipelineName = 'main';
        if (cameraSetting) {
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
