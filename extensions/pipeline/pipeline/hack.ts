import { assetManager, CCObject, clamp, Director, director, Game, game, instantiate, Prefab, profiler, ReflectionProbeManager, RenderTexture } from "cc";
import { EDITOR } from "cc/env";
import { HrefSetting } from "./settings/href-setting";

RenderTexture.prototype.resize = function resize (width: number, height: number) {
    this._width = Math.floor(clamp(width, 1, 4096));
    this._height = Math.floor(clamp(height, 1, 4096));
    if (this._window) {
        this._window.resize(this._width, this._height);
    }
    this.emit('resize', this._window);
}


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
        if (ReflectionProbeManager !== undefined) {
            director.off(Director.EVENT_BEFORE_UPDATE, ReflectionProbeManager.probeManager.onUpdateProbes, ReflectionProbeManager.probeManager);
        }

        if (HrefSetting.showFps) {
            profiler.showStats()
        }
    })
}
