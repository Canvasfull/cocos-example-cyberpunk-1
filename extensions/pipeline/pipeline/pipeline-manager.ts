import { _decorator, renderer, rendering, ReflectionProbeManager, ReflectionProbe, Node, CCObject, game, Game, debug, profiler } from 'cc';
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

        const probes = ReflectionProbeManager.probeManager.getProbes();
        for (let i = 0; i < probes.length; i++) {
            let probe = probes[i];

            if (probe.needRender) {
                settings.OUTPUT_RGBE = true;

                let originCameraNode = probe.cameraNode;
                let originCamera = probe.camera;
                let originName = originCamera.name;
                if (!probe.cameras || !probe.cameras.length) {
                    probe.cameras = []
                    for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
                        probe._camera = null;
                        const tempNode = new Node(probe.node.name + ' Camera ' + faceIdx);
                        tempNode.hideFlags |= CCObject.Flags.DontSave | CCObject.Flags.HideInHierarchy;
                        tempNode.parent = probe.node;

                        let camera = probe._createCamera(tempNode);
                        camera._name = originName + faceIdx;
                        probe.cameras.push(camera);

                        // let faceIdx = 4;
                        const window = probe.bakedCubeTextures[faceIdx].window;
                        camera.changeTargetWindow(window);
                        camera.setFixedSize(window.width, window.height);
                        camera.update();
                    }
                }

                for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
                    let camera = probe.cameras[faceIdx];
                    camera.attachToScene(probe.node.scene.renderScene);

                    passUtils.camera = camera;
                    probe._camera = camera;
                    probe.cameraNode = camera.node;

                    //update camera dirction
                    probe.updateCameraDir(faceIdx);

                    this.renderCamera(camera, ppl, true)

                    let index = cameras.indexOf(camera);
                    if (index !== -1) {
                        cameras.splice(index, 1);
                    }
                }

                probe._camera = originCamera;
                probe.cameraNode = originCameraNode;

                probe.needRender = false;
                settings.OUTPUT_RGBE = false;
            }
        }

        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!camera.scene) {
                continue;
            }
            if (camera.node.getComponent(ReflectionProbe)) {
                continue;
            }
            // buildDeferred(camera, ppl);

            camera.culled = false;

            passUtils.camera = camera;
            this.renderCamera(camera, ppl)
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
        if (!stages) {
            return;
        }

        for (let i = 0; i < stages.length; i++) {
            stages[i].render(camera, ppl);
        }
    }
}

// if (!EDITOR) {
rendering.setCustomPipeline('Deferred', new CustomPipelineBuilder)
// }

if (!EDITOR) {
    game.on(Game.EVENT_GAME_INITED, () => {
        profiler.showStats()
    })
}
