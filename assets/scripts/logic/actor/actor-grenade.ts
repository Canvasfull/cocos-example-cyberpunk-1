import { _decorator, v3 } from 'cc';
import { ActorEquipBase } from './actor-equip-base';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { ProjectileGrenade } from './projectile-grenade';
import { Level } from '../level/level';
const { ccclass, property } = _decorator;

@ccclass('ActorGrenade')
export class ActorGrenade extends ActorEquipBase {

    onFire() {
        const forwardNode = this._actor!._forwardNode!;
        const origin = forwardNode.worldPosition;
        const dir = forwardNode.forward;
        const prefab = ResCache.Instance.getPrefab(this._data.projectile_res);
        let position = v3(origin.x, origin.y, origin.z);
        position.add(dir);
        const projectile = Res.instNode(prefab, Level.Instance._objectNode, position);
        const projectileGrenade = projectile.getComponent(ProjectileGrenade);
        const throwDir = dir.multiplyScalar(10);
        projectileGrenade?.onThrow(this._data, throwDir, this._actor);
    }

}

