import { _decorator, Component, Node, Vec3 } from 'cc';
import { Res } from '../res/res';
import { ResCache } from '../res/res-cache';
const { ccclass, property } = _decorator;

@ccclass('fx')
export class fx {

    public static node:Node;

    public static init(node) {
        this.node = node;
    }

    public static on(name:string, pos:Vec3) {

        var prefab = ResCache.Instance.getPrefab(name);
        var newFx = Res.inst(prefab, this.node, pos);

    }

}

