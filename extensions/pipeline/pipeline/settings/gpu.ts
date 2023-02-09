import { sys } from 'cc';
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

let director = cc.director
let game = cc.game

// game.on(Game.EVENT_ENGINE_INITED, () => {
let renderer = '';
if (director.root && director.root.device) {
    renderer = director.root.device.renderer;
}
console.log('gpu : ' + renderer)

detectGPU.getGPUTier({
    // benchmarksURL: 'https://preview.cocos.com/cyberpunk/',
    mobileTiers: [0, 60, 150, 300],
    desktopTiers: [0, 60, 150, 300],
    override: {
        renderer,
        isMobile: sys.isMobile,
        screenSize: {
            width: game.canvas.width,
            height: game.canvas.height
        }
    }
}).then((tier: any) => {
    gpuTier = tier;

    for (let name in tier) {
        gpuTier[name] = tier[name];
    }

    if (MINIGAME) {
        gpuTier.tier = 1;
    }
    else if (sys.isMobile) {
        gpuTier.tier -= 1;
    }

    inited = true;
    gpuTierUpdated.invoke();
});

// })
