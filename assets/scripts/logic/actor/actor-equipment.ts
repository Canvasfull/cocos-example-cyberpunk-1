import { _decorator, Node, game, math } from 'cc';
import { Msg } from "../../core/msg/msg";
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { UtilNode } from '../../core/util/util';
import { Actor } from "./actor";
import { BagItems } from './actor-bag';
import { CameraSetting } from '../../../../extensions/pipeline/pipeline/camera-setting';
import { fun } from '../../core/util/fun';


export class ActorEquipment {

    _actor:Actor;
    equipPool:{ [key:string]:Node } = {};
    equipBoneNode: { [key:string]:Node } = {};
    curEquip:Node | undefined;
    curData:BagItems | undefined;
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
            if (curIndex !== -1) this.unEquip();

            if (index === -1) {
                this._actor._data.cur_equip_bag_index = -1;
                this.curData = undefined;
                // show hand.
                return false;
            }

            // Change new weapon.
            const curEquipName = items_index[index];
            if (curEquipName.length > 0) {
                const self = this;
                fun.delay(()=>{
                    this.curEquip = this.equipPool[curEquipName];
                    this.curData = items[curEquipName];
                    self.curEquip!.active = true;
                    self.curEquip!.emit('init',this.curData);
                    self.curEquip!.emit('do', 'take_out');
                    self._actor._data.cur_equip_bag_index = index;
                    if(this._actor.isPlayer) {
                        //const mainCamera = CameraSetting.main?.camera;
                        //if(mainCamera) mainCamera.fov = this.curData!.fov;
                        Msg.emit('msg_change_equip');
                        Msg.emit('msg_update_equip_info');
                    }
                }, 1)
            }

        }

        return this.curEquip !== undefined;

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
        this.curEquip?.emit('do', action);
    }

    public updateAim(stable:number) {
        
        if (this.curData === undefined) {
            if (this.stableValue !== 0){
                this.stableValue = 0;
                if(this._actor.isPlayer) Msg.emit('msg_update_aim',  this.stableValue);
            }
        }else{
            const equipStable = this.curData.data.stable_value;
            let curStable = 0;
            if (equipStable !== 0) {
                curStable = Math.abs(stable) <= 0.001 ? this.curData.data.stable_min_value : equipStable;
            }
            this.stableValue = math.lerp(this.stableValue, curStable, game.deltaTime * 2);
            if(this._actor.isPlayer) Msg.emit('msg_update_aim', this.stableValue);
        }
    }

}