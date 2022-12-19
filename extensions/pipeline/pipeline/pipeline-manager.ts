import { _decorator, renderer, rendering, ReflectionProbeManager, ReflectionProbe, Node, CCObject, game, Game, debug, profiler, Mat4, assetManager, instantiate, Prefab, director, Director } from 'cc';
import { BaseStage } from './stages/base-stage';
import { CameraSetting } from './camera-setting';
import { EDITOR } from 'cc/env';
import { buildDeferred } from './test-custom';
import { passUtils } from './utils/pass-utils';
import { settings } from './stages/setting';
import { TAASetting } from './components/taa';
import { PipelineAssets } from './resources/pipeline-assets';
import { HrefSetting } from './settings/href-setting';

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
        if (!globalThis.pipelineAssets) {
            return;
        }

        director.root.pipeline.pipelineSceneData.shadingScale = HrefSetting.shadingScale

        // if (EDITOR) {
        //     excludes.push('Main Camera')
        // }

        passUtils.ppl = ppl;

        const probes = ReflectionProbeManager.probeManager.getProbes();
        for (let i = 0; i < probes.length; i++) {
            let probe = probes[i];

            if (probe.needRender) {
                settings.outputRGBE = true;

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
                settings.outputRGBE = false;
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

        settings.tonemapped = false;

        let cameraSetting = camera.node.getComponent(CameraSetting);

        let pipelineName = 'forward';
        if (cameraSetting) {
            pipelineName = cameraSetting.pipeline;
        }
        else if (camera.name === 'Editor Camera' || forceMain) {
            pipelineName = 'main';
        }
        // else if (EDITOR && !EditorCameras.includes(camera.name)) {
        //     return;
        // }

        if (!EDITOR && TAASetting.instance && pipelineName === 'main') {
            (camera as any)._isProjDirty = true
            camera._onCalcProjMat = function () {
                if (TAASetting.instance.enable) {
                    this.matProj.m12 += TAASetting.instance.sampleOffset.x;
                    this.matProj.m13 += TAASetting.instance.sampleOffset.y;
                }
            }
            camera.update(true)
            // camera.matProj.m12 += TAASetting.instance.sampleOffset.x;
            // camera.matProj.m13 += TAASetting.instance.sampleOffset.y;
            // // console.log(TAASetting.instance.sampleOffset)
            // // console.log(camera.matProj)

            // Mat4.invert(camera.matProjInv, camera.matProj);

            // Mat4.multiply(camera.matViewProj, camera.matProj, camera.matView);
            // // console.log(camera.matProj)
            // // console.log(camera.matViewProj)

            // Mat4.invert(camera.matViewProjInv, camera.matViewProj);
            // camera.frustum.update(camera.matViewProj, camera.matViewProjInv);
        }

        let stages = CustomPipelineBuilder.pipelines.get(pipelineName);
        if (!stages) {
            return;
        }

        camera._submitInfo = null;

        for (let i = 0; i < stages.length; i++) {
            stages[i].render(camera, ppl);
        }
    }
}

// if (!EDITOR) {
rendering.setCustomPipeline('Deferred', new CustomPipelineBuilder)
// }


game.on(Game.EVENT_GAME_INITED, () => {
    if (!globalThis.__pipeline__) {
        assetManager.loadAny('223548d6-e1d4-462a-99e1-f4046b1d0647', (err, pipPrefab: Prefab) => {
            if (err) {
                return console.error(err);
            }
            let p = instantiate(pipPrefab)
            p.name = 'pipeline-default-persist';
            p.hideFlags |= CCObject.Flags.DontSave;// | CCObject.Flags.HideInHierarchy;
            globalThis.__pipeline__ = p;
        })
    }
})

if (!director.__runSceneImmediate) {
    director.__runSceneImmediate = director.runSceneImmediate
}
director.runSceneImmediate = function (scene, onBeforeLoadScene, onLaunched) {
    globalThis.__pipeline__.parent = null;

    director.__runSceneImmediate.call(this, scene, onBeforeLoadScene, onLaunched)

    if (!globalThis.pipelineAssets && globalThis.__pipeline__) {
        globalThis.__pipeline__.parent = director.getScene()
    }
}


if (!EDITOR) {
    game.on(Game.EVENT_GAME_INITED, () => {
        profiler.showStats()
    })
}
