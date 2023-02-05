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

import { _decorator, Node, game, math } from 'cc';
import { Msg } from "../../core/msg/msg";
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { UtilNode } from '../../core/util/util';
import { Actor } from "./actor";
import { BagItems } from './actor-bag';
import { fun } from '../../core/util/fun';
import { ActorEquipBase } from './actor-equip-base';


export class ActorEquipment {

    // The character object to which the current equipment belongs.
    _actor:Actor;

    // A pool of cached equipment objects.
    //The purpose is to avoid the creation and destruction of objects at runtime.
    equipPool:{ [key:string]:Node } = {};

    // Dictionary of weapon skeleton nodes for mounted equipment.
    equipBoneNode: { [key:string]:Node } = {};

    // Current equipment node.
    currentEquipNode:Node | undefined;

    // bag information of current equipment.
    currentEquipBagItems:BagItems | undefined;

    // The component object of the current weapon.
    currentEquip:ActorEquipBase | undefined;

    // The stability value of the equipment.
    // The purpose is to describe the stability value of the shot.
    // This value affects the size of the aiming area of the shot.
    stableValue = 1;

    constructor(actor:Actor) {

        // Initialize the Actor object corresponding to the equipment manager passed in.
        this._actor = actor;

        // Get all node maps with the name 'weapon_root'.
        this.equipBoneNode = UtilNode.getChildrenByNameBlur(this._actor.node, 'weapon_root');

        // Initialize the cache pool for the equipment list.
        const equipmentList = this._actor._data.cache_equipment_list;

        // Get the length of the equipment list.
        const length = equipmentList.length;
        for(let i = 0; i < length; i++) {

            // Get the equipment name from the current index.
            const weaponName = equipmentList[i];

            // Get the prefab of the equipment from the resource buffer pool.
            const prefab = ResCache.Instance.getPrefab(weaponName + '_tps');

            // Get the bone node of the equipment.
            const bindNode = this.equipBoneNode[this._actor._data.weapon_bone];

            // Instantiate the game object and set the parent node to the bone node.
            const nodePrefab = Res.inst(prefab, bindNode);

            // Set the object pool key to map to this instantiated weapon object.
            this.equipPool[weaponName] = nodePrefab;

            // Set the activity of this cache object to false.
            nodePrefab.active = false;
        }

        // Equip the default weapon.
        this.equip(actor._data.default_equip_index);
    }

    public equip(replaceEquipmentIndex:number):boolean {

        // Get the current bag equipment index.
        const currentEquipmentIndex = this._actor._data.current_equipment_index;

        // If the current bag index is the same as the updated bag index, 
        // true is no need to switch weapons, false is need to switch weapons.
        if (currentEquipmentIndex !== replaceEquipmentIndex) {

            // Get bag equipment name list from player data.
            const equipment_name_list = this._actor._data.equipment_name_list;

            // Get the name of the equipment name to be switched from the equipment list.
            const changeEquipmentName = equipment_name_list[replaceEquipmentIndex];

            // Return false if the equipment does not exist or is not empty to cancel switching equipment.
            if(!changeEquipmentName || changeEquipmentName.length <= 0) return false;

            // Uninstall current equipment.
            this.unEquip();

            // Replace new equipment data and models.
            // Here you need to do a time delay with the animation.
            const self = this;
            fun.delay(()=>{
                const items = self._actor._data.items;
                self.currentEquipNode = self.equipPool[changeEquipmentName];
                self.currentEquipBagItems = items[changeEquipmentName];
                self.currentEquipNode!.active = true;
                self.currentEquipNode!.emit('init',this.currentEquipBagItems);
                self.currentEquipNode!.emit('do', 'take_out');
                self._actor._data.current_equipment_index = replaceEquipmentIndex;
                self.currentEquip = self.currentEquipNode?.getComponent(ActorEquipBase)!;
                if(this._actor.isPlayer) {
                    //const mainCamera = CameraSetting.main?.camera;
                    //if(mainCamera) mainCamera.fov = this.currentEquipBagItems!.fov;
                    Msg.emit('msg_change_equip');
                    Msg.emit('msg_update_equip_info');
                }
            }, 0.3)

            return true;

        }else{
            return false;
        }

    }

    /**
     * Uninstall current equipment.
     */
    public unEquip() {

        //Get the index of the current equipment.s
        const currentEquipmentIndex = this._actor._data.current_equipment_index;

        // Compare whether the current equipment index value is -1.
        // An index of -1 means no current equipment, skip setting.
        if (currentEquipmentIndex !== -1) {

            // Get a list of equipment names.
            const equipment_name_list = this._actor._data.equipment_name_list; 

            // Get the current equipment name.
            const currentEquipmentName = equipment_name_list[currentEquipmentIndex];

            // Whether the current equipment name exists.
            // false means it does not exist, the return function does not uninstall the equipment
            if(!currentEquipmentName) {
                console.warn(`The equipment index that does not exist, the index id is ${currentEquipmentIndex}, the object is ${this._actor?.node.name}`)
                return;
            }

            // Get the current equipment object node from the equipment object pool.
            const currentEquipmentNode = this.equipPool[currentEquipmentName];

            //Whether the object pool contains equipment objects.
            if (currentEquipmentNode) {
                // Notify the equipment node to perform recovery behavior.
                currentEquipmentNode.emit('do', 'take_back');
            }else{
                console.warn(``);
            }
        }
    }

    /**
     * Execution equipment action.
     * @param action Name of the execution action.
     */
    public do(action:string) {
        // Execute the current equipment action.
        this.currentEquipNode?.emit('do', action);
    }

    /**
     * Update to set the range of Aim.
     * @param normalizeCharacterMoveSpeed Normalized character movement speed.
     * @param toMax The aim range is set to the maximum value: true is set, false is not set. 
     */
    public updateAim(normalizeCharacterMoveSpeed:number, toMax = false) {
        
        if (this.currentEquipBagItems === undefined) {
            if (this.stableValue !== 0){
                this.stableValue = 0;
                if(this._actor.isPlayer) Msg.emit('msg_update_aim',  this.stableValue);
            }
        }else{
            const equipData = this.currentEquipBagItems.data;
            const equipStable = equipData.stable_max_value;
            let currentStable = 0;
            if(toMax) {
                this.stableValue = equipData.stable_max_value;
                currentStable = equipData.stable_max_value;
            }else{
                if (equipStable !== 0) {
                    currentStable = Math.abs(normalizeCharacterMoveSpeed) <= 0.001 ? equipData.stable_min_value : equipData.stable_max_value * normalizeCharacterMoveSpeed;
                    currentStable = Math.max(equipData.stable_min_value, currentStable);
                }
                this.stableValue = math.lerp(this.stableValue, currentStable, game.deltaTime * equipData.stable_smooth);
            }
            
            if(this._actor.isPlayer) Msg.emit('msg_update_aim', this.stableValue);
        }
    }

}