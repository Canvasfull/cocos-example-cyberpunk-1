import { _decorator, renderer, rendering, ReflectionProbeManager, ReflectionProbe, Node, CCObject, game, Game, debug, profiler, Mat4, assetManager, instantiate, Prefab, director, Director } from 'cc';
import { BaseStage } from './stages/base-stage';
import { CameraSetting } from './camera-setting';
import { EDITOR, JSB } from 'cc/env';
import { buildDeferred } from './test-custom';
import { passUtils } from './utils/pass-utils';
import { settings } from './stages/setting';
import { HrefSetting } from './settings/href-setting';
import { TAAStage } from './stages/taa-stage';
import { CustomShadowStage } from './stages/shadow-stage';
import { getCameraUniqueID } from './utils/utils';

let EditorCameras = [
    // 'scene:material-previewcamera',
    // 'Scene Gizmo Camera',
    // 'Editor UIGizmoCamera',

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

    private _shadowStage: CustomShadowStage | undefined
    get shadowStage () {
        if (!this._shadowStage) {
            this._shadowStage = new CustomShadowStage()
        }
        return this._shadowStage
    }

    setupReflectionProbe (cameras: renderer.scene.Camera[], ppl: rendering.Pipeline) {
        if (ReflectionProbeManager === undefined) {
            return;
        }

        const probes = ReflectionProbeManager.probeManager.getProbes();
        for (let i = 0; i < probes.length; i++) {
            let probe = probes[i];

            if (probe.needRender) {
                settings.outputRGBE = true;
                settings.bakingReflection = true;

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
                    }
                }

                for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
                    let camera = probe.cameras[faceIdx];
                    camera.attachToScene(probe.node.scene.renderScene);

                    const window = probe.bakedCubeTextures[faceIdx].window;
                    camera.changeTargetWindow(window);
                    camera.setFixedSize(window.width, window.height);
                    camera.update();

                    passUtils.camera = camera;
                    probe._camera = camera;
                    probe.cameraNode = camera.node;

                    //update camera dirction
                    probe.updateCameraDir(faceIdx);

                    this.renderCamera(camera, ppl, 'reflection-probe')

                    let index = cameras.indexOf(camera);
                    if (index !== -1) {
                        cameras.splice(index, 1);
                    }
                }

                probe._camera = originCamera;
                probe.cameraNode = originCameraNode;

                probe.needRender = false;
                settings.outputRGBE = false;
                settings.bakingReflection = false;
            }
        }
    }

    public setup (cameras: renderer.scene.Camera[], ppl: rendering.Pipeline): void {
        if (!globalThis.pipelineAssets) {
            return;
        }

        director.root.pipeline.pipelineSceneData.shadingScale = HrefSetting.shadingScale

        passUtils.ppl = ppl;

        this.setupReflectionProbe(cameras, ppl);

        for (let i = 0; i < cameras.length; i++) {
            const camera = cameras[i];
            if (!camera.scene) {
                continue;
            }
            if (camera.node.getComponent(ReflectionProbe)) {
                continue;
            }
            // buildDeferred(camera, ppl);


            passUtils.camera = camera;
            this.renderCamera(camera, ppl)
        }
    }
    renderCamera (camera: renderer.scene.Camera, ppl: rendering.Pipeline, pipelineName = '') {
        // const isGameView = camera.cameraUsage === renderer.scene.CameraUsage.GAME
        // || camera.cameraUsage === renderer.scene.CameraUsage.GAME_VIEW;

        if (EditorCameras.includes(camera.name)) {
            return
        }

        // reset states
        {
            settings.tonemapped = false;
            settings.shadowStage = undefined;
            settings.gbufferStage = false;
            settings.renderedProfiler = false;
            settings.passPathName = '';

            // camera._submitInfo = null;
            // camera.culled = false;
        }

        let cameraSetting = camera.node.getComponent(CameraSetting);

        if (!pipelineName) {
            pipelineName = 'forward';
            if (cameraSetting) {
                pipelineName = cameraSetting.pipeline;
            }
            else if (camera.name === 'Editor Camera') {
                pipelineName = 'main';
            }
        }
        // else if (EDITOR && !EditorCameras.includes(camera.name)) {
        //     return;
        // }

        let stages = CustomPipelineBuilder.pipelines.get(pipelineName);
        if (!stages) {
            return;
        }

        let taaStage = stages.find(s => s instanceof TAAStage) as TAAStage;
        if (taaStage && taaStage.checkEnable()) {
            (camera as any)._isProjDirty = true
            camera.update(true)

            camera.matProj.m12 += globalThis.TAASetting.instance.sampleOffset.x;
            camera.matProj.m13 += globalThis.TAASetting.instance.sampleOffset.y;

            Mat4.invert(camera.matProjInv, camera.matProj);
            Mat4.multiply(camera.matViewProj, camera.matProj, camera.matView);
            Mat4.invert(camera.matViewProjInv, camera.matViewProj);
            camera.frustum.update(camera.matViewProj, camera.matViewProjInv);
        }

        settings.passPathName += getCameraUniqueID(camera);
        let lastStage: BaseStage | undefined = undefined;
        for (let i = 0; i < stages.length; i++) {
            let stage = stages[i];
            if (!stage.checkEnable()) {
                continue;
            }
            stage.lastStage = lastStage;
            // settings.passPathName += '_' + stage.name;
            stage.render(camera, ppl);

            lastStage = stage
        }
    }
}

// if (!JSB) {
rendering.setCustomPipeline('Deferred', new CustomPipelineBuilder)
// }

game.on(Game.EVENT_RENDERER_INITED, () => {
    director.root.pipeline.setMacroInt('CC_PIPELINE_TYPE', 1);
})
