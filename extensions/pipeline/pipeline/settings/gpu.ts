import { sys } from 'cc';
import { MINIGAME } from 'cc/env';
import Event from '../utils/event';

import detectGPU from '../lib/detect-gpu.umd.js'

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

detectGPU.getGPUTier({
    mobileTiers: [0, 60, 150, 300],
    desktopTiers: [0, 60, 150, 300]
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
