import { _decorator, Node, game, math } from 'cc';
import { Msg } from "../../core/msg/msg";
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { UtilNode } from '../../core/util/util';
import { Actor } from "./actor";
import { BagItems } from './actor-bag';
import { CameraSetting } from '../../../../extensions/pipeline/pipeline/camera-setting';
import { fun } from '../../core/util/fun';
import { ActorEquipBase } from './actor-equip-base';


export class ActorEquipment {

    _actor:Actor;
    equipPool:{ [key:string]:Node } = {};
    equipBoneNode: { [key:string]:Node } = {};

    // Current equip node.
    currentEquipNode:Node | undefined;

    // Current equip bag info.
    currentEquipBagItems:BagItems | undefined;

    // Current equip.
    currentEquip:ActorEquipBase | undefined;

    stableValue = 1;

    constructor(actor:Actor) {
        this._actor = actor;
        this.equipBoneNode = UtilNode.getChildrenByNameBlur(this._actor.node, 'weapon_root');

        //cache weapons.
        const weapons = this._actor._data.cache_weapons;
        const count = weapons.length;
        for(let i = 0; i < count; i++) {
            const weaponName = weapons[i];
            const prefab = ResCache.Instance.getPrefab(weaponName + '_tps');
            const bindNode = this.equipBoneNode[this._actor._data.weapon_bone];
            const nodePrefab = Res.inst(prefab, bindNode);
            nodePrefab.setPosition(0, 0, 0);
            this.equipPool[weaponName] = nodePrefab;
            nodePrefab.active = false;
        }

        this.equip(actor._data.default_equip_index);
    }

    public equip(index:number):boolean {

        const curIndex = this._actor._data.cur_equip_bag_index;
        if (curIndex !== index) {
            const items_index = this._actor._data.items_index;
            const items = this._actor._data.items;

            // unEquip
            if (curIndex !== -1) this._actor._data.items_index = 0; //this.unEquip();

            /*
            if (index === -1) {
                this._actor._data.cur_equip_bag_index = -1;
                this.currentEquipBagItems = undefined;
                // Show hand.
                return false;
            }
            */

            // Change new weapon.
            const currentEquipNodeName = items_index[index];
            if (currentEquipNodeName.length > 0) {
                const self = this;
                fun.delay(()=>{
                    self.currentEquipNode = self.equipPool[currentEquipNodeName];
                    self.currentEquipBagItems = items[currentEquipNodeName];
                    self.currentEquipNode!.active = true;
                    self.currentEquipNode!.emit('init',this.currentEquipBagItems);
                    self.currentEquipNode!.emit('do', 'take_out');
                    self._actor._data.cur_equip_bag_index = index;
                    self.currentEquip = self.currentEquipNode?.getComponent(ActorEquipBase)!;

                    if(this._actor.isPlayer) {
                        //const mainCamera = CameraSetting.main?.camera;
                        //if(mainCamera) mainCamera.fov = this.currentEquipBagItems!.fov;
                        Msg.emit('msg_change_equip');
                        Msg.emit('msg_update_equip_info');
                    }
                }, 0.3)
            }

        }

        return this.currentEquipNode !== undefined;

    }

    public unEquip() {
        const curIndex = this._actor._data.cur_equip_bag_index;
        if (curIndex !== -1) {
            const items_index = this._actor._data.items_index; 
            const curNode = this.equipPool[items_index[curIndex]];
            //this.do('take_back');
            if (curNode !== undefined) {
                curNode.emit('do', 'take_back');
                //curNode.active = false;
            }
        }
    }

    public do(action:string) {
        this.currentEquipNode?.emit('do', action);
    }

    public updateAim(normalizeSpeed:number, toMax = false) {
        
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
                    currentStable = Math.abs(normalizeSpeed) <= 0.001 ? equipData.stable_min_value : equipData.stable_max_value * normalizeSpeed;
                    currentStable = Math.max(equipData.stable_min_value, currentStable);
                }
                this.stableValue = math.lerp(this.stableValue, currentStable, game.deltaTime * equipData.stable_smooth);
            }
            
            if(this._actor.isPlayer) Msg.emit('msg_update_aim', this.stableValue);
        }
    }

}