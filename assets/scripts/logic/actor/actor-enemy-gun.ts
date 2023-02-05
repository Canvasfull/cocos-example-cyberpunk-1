/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { _decorator } from 'cc';
import { geometry, PhysicsSystem, PhysicsRayResult } from 'cc';
import { ActorEquipBase } from './actor-equip-base';
import { calculateDamage } from './damage-core';
import { UtilVec3 } from '../../core/util/util';
const { ccclass, property } = _decorator;
let ray = new geometry.Ray();

@ccclass('ActorEnemyGun')
export class ActorEnemyGun extends ActorEquipBase {
    
    /**
     * Execute fire.
     */
    onFire() {

        if(!this._actor?._forwardNode) return;
        
        // The number of bullets is reduced by one.
        this._bagData!.bulletCount--;

        // Get the weapon shooting direction node.
        const forwardNode = this._actor!._forwardNode!;

        // Get Weapon Shooting Points
        const origin = forwardNode.worldPosition;

        // Get the weapon shooting direction.
        const shootDirection = forwardNode.forward;

        // Set physical ray detection parameters.
        UtilVec3.copy(ray.o, origin);
        UtilVec3.copy(ray.d, shootDirection);

        // Get weapon range.
        const distance = this._data.damage.distance;

        // Start physical shot detection.
        let hit:PhysicsRayResult | undefined;
        if (PhysicsSystem.instance.raycastClosest(ray, this.mask, distance)) {
            hit = PhysicsSystem.instance.raycastClosestResult;
        }

        // Show Tracer line.
        this.showTracer(hit, shootDirection);

        // Calculates shot damage.
        calculateDamage(this._data, hit);
    }
    
}

