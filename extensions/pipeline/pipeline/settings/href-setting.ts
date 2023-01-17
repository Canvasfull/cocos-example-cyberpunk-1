import { EDITOR } from 'cc/env';
import { getTier, gpuTierUpdated, RenderQulity } from './gpu';

export const HrefSetting = {
    settings: 0,
    spector: 0,
    shadingScale: 1,
    graph: 0,
    pauseGraphAfterLoad: 1,
    zoomScreen: 0,
    taa: 1,
    bloom: 1,
    showFps: 0,
    fps: 60
}
globalThis.HrefSetting = HrefSetting

export let changedMap: Map<string, boolean> = new Map

if (!EDITOR) {
    let href = window && window.location && window.location.href;
    let settings = href.split('?')[1]
    if (settings) {
        let results = settings.match(/([a-zA-Z]+=[0-9\.]+)/g)
        results.forEach(res => {
            let test = res.split('=')
            let value = Number.parseFloat(test[1])
            if (typeof value === 'number') {
                HrefSetting[test[0]] = value

                changedMap.set(test[0], true)
            }
        })
    }

}

if (EDITOR) {
    HrefSetting.graph = 2;
}

const LowSetting = {
    bloom: 0,
    shadingScale: 0.7,
    fps: 30
}
const MediumSetting = {
    bloom: 0,
    shadingScale: 0.7,
    fps: 30
}
const HighSetting = {
    bloom: 1,
    shadingScale: 1,
    fps: 60
}

gpuTierUpdated.once(() => {
    let tire = getTier()
    let qualitySetting = LowSetting;
    if (tire === RenderQulity.Medium) {
        qualitySetting = MediumSetting
    }
    else if (tire >= RenderQulity.High) {
        qualitySetting = HighSetting
    }

    for (let name in qualitySetting) {
        if (changedMap.get(name)) {
            continue;
        }

        HrefSetting[name] = qualitySetting[name]
    }
})
