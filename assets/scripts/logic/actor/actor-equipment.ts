import { _decorator, Component, Node, game, math } from 'cc';
import { Msg } from "../../core/msg/msg";
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { UtilNode } from '../../core/util/util';
import { Actor } from "./actor";
import { BagItems } from './actor-bag';
import { ActorEquipBase } from './actor-equip-base';


export class ActorEquipment {

    _actor:Actor;

    equipPool:{ [key:string]:Node } = {};

    equipBoneNode: { [key:string]:Node } = {};

    curEquip:Node | undefined;

    curData:BagItems | undefined;

    stableValue = 1;

    constructor(actor:Actor) {
        this._actor = actor;
        this.equipBoneNode = UtilNode.getChildrenByNameBlur(this._actor.node, 'bone_point_');
        this.equip(1);
    }

    public equip(index:number):boolean {

        const curIndex = this._actor._data.cur_equip_bag_index;
        if(curIndex !== index) {
            const items_index = this._actor._data.items_index;
            const items = this._actor._data.items;

            // unEquip
            if(curIndex !== -1) this.unEquip();

            if(index == -1) {
                this._actor._data.cur_equip_bag_index = -1;
                this.curData = undefined;
                // show hand.
                return false;
            }

            // Change new weapon.
            const curEquipName = items_index[index];
            if(curEquipName.length > 0) {
                var newEquip = this.equipPool[curEquipName];
                this.curData = items[curEquipName];
                if(newEquip != undefined) {
                    newEquip.active = true;
                }else{
                    const prefab = ResCache.Instance.getPrefab(curEquipName + '_fps');
                    const bindNdoe = this.equipBoneNode[this.curData.data.bind_bone];
                    const nodePrefab = Res.inst(prefab, bindNdoe);
                    nodePrefab.setPosition(0, 0, 0);
                    this.equipPool[curEquipName] = nodePrefab;
                }
                this.curEquip = this.equipPool[curEquipName];
                this.curEquip.emit('init',this.curData);
                this._actor._data.cur_equip_bag_index = index;
                Msg.emit('msg_change_equip');
                Msg.emit('msg_update_equip_info');
            }

        }

        return this.curEquip !== undefined;

    }

    public unEquip() {
        const curIndex = this._actor._data.cur_equip_bag_index;
        if(curIndex != -1) {
            const items_index = this._actor._data.items_index; 
            const curNode = this.equipPool[items_index[curIndex]];
            if (curNode !== undefined) {
                curNode.active = false;
            }
        }
    }

    public do(action:string) {
        this.curEquip?.emit('do', action);
    }

    public updateAim(stable:number) {
        
        if(this.curData === undefined) {
            if(this.stableValue != 0){
                this.stableValue = 0;
                Msg.emit('msg_update_aim',  this.stableValue);
            }
        }else{
            const equipStable = this.curData.data.stable_value;
            let curStable = 0;
            if(equipStable !== 0) {
                curStable = Math.abs(stable) <= 0.001 ? 1 : equipStable;
            }
            this.stableValue = math.lerp(this.stableValue, curStable, game.deltaTime * 2);
            Msg.emit('msg_update_aim', this.stableValue);
        }
    }

}