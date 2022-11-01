import { sys } from 'cc';
import { MINIGAME } from 'cc/env';
// @ts-ignore
import detectGPU from 'detect-gpu';
import Event from '../utils/event';

export enum RenderQulity {
    High,
    Medium,
    Low,
    SuperLow
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
    let tier = gpuTier.tier;
    tier = Math.max(0, Math.min(tier, Tiers.length - 1));
    return Tiers.length - 1 - tier;
}

export function getTierName () {
    let tier = getTier();
    return Tiers[tier];
}

(window as any).getGPUTier = detectGPU.getGPUTier;
(window as any).getTierName = getTierName;
