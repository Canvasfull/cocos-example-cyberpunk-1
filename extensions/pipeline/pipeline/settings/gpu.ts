import { director, game, sys } from 'cc';
import { JSB, MINIGAME } from 'cc/env';
import Event from '../utils/event';

// import detectGPU from '../lib/detect-gpu.umd.js'

import * as detectGPU from '../lib/detect-gpu'

export enum RenderQulity {
    Low,
    Medium,
    High,
}


export let Tiers = Object.keys(RenderQulity).filter(v => isNaN(parseFloat(v)))

export let gpuTier = {
    tier: 2,
    fps: 0,
    gpu: ''
};

export let gpuTierUpdated = new Event;

let inited = false;

export async function waitForGpuInited () {
    if (inited) {
        return;
    }
    else {
        return new Promise((resolve) => {
            gpuTierUpdated.once(() => {
                resolve(null);
            })
        })
    }
}

export function getTier () {
    return Math.max(0, gpuTier.tier);
}

export function getTierName () {
    let tier = getTier();
    return Tiers[tier];
}

(window as any).getGPUTier = detectGPU.getGPUTier;
(window as any).getTierName = getTierName;

// game.on(Game.EVENT_ENGINE_INITED, () => {
let renderer = '';
if (director.root && director.root.device) {
    renderer = director.root.device.renderer;
}

detectGPU.getGPUTier({
    // benchmarksURL: 'https://preview.cocos.com/cyberpunk/',
    mobileTiers: [0, 60],
    desktopTiers: [0, 60, 150, 300],
    override: {
        renderer,
        isMobile: sys.isMobile,
        screenSize: {
            width: game.canvas ? game.canvas.width : 1000,
            height: game.canvas ? game.canvas.height : 1000,
        }
    }
}).then((tier: any) => {
    gpuTier = tier;

    for (let name in tier) {
        gpuTier[name] = tier[name];
    }

    if (MINIGAME) {
        gpuTier.tier = 0;
    }

    console.log('gpu : ' + renderer)
    console.log('gpuTier : ' + gpuTier.tier)

    inited = true;
    gpuTierUpdated.invoke();
});

// })
