import { _decorator, Component, Node, ParticleSystem, Vec3 } from 'cc';
import { Res } from '../res/res';
import { ResCache } from '../res/res-cache';
import { UtilNode } from '../util/util';
import { FxBase } from './fx-base';
const { ccclass, property } = _decorator;

@ccclass('fx')
export class fx {

    public static node:Node;

    public static init(node: Node) {
        this.node = node;
    }

    public static on(name:string, pos:Vec3) {
        var prefab = ResCache.Instance.getPrefab(name);
        var newFx = Res.inst(prefab, this.node, pos);
    }

    public static play(node:Node, name:string) {
        const fxNode = UtilNode.find(node, name);
        const fx = fxNode.getComponent(FxBase);
        fx?.play();
    }

    public static playLoop(node:Node, name:string, isLoop:boolean) {
        const pNode = UtilNode.find(this.node, name);
        var particles = pNode?.getComponentsInChildren(ParticleSystem);
        if (particles === undefined) {
            console.warn(` effect can not find ${name}`);
            return;
        }
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.loop = isLoop;
            if (isLoop) p.play();
        }
    }

}

