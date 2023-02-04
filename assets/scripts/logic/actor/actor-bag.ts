import { game, _decorator } from 'cc';
import { Msg } from '../../core/msg/msg';
import { DataEquipInst } from '../data/data-core';
import { Game } from '../data/game';
import { Level } from '../level/level';
import { Actor } from './actor';

export class ActorBag {

    _actor:Actor;

    constructor(actor:Actor) {
        this._actor = actor;

        // Init bag space.
        this._actor._data.equipment_name_list = new Array<string>(Game.Instance._data.count_bag_count);
        for(var i = 0; i < this._actor._data.equipment_name_list.length; i++)
            this._actor._data.equipment_name_list[i] = '';

        // picked default bags
        const bags = actor._data.bags;
        for(let i = 0; i < bags.length; i++) {
            this.pickedItem(bags[i]);
        }
    }

    public checkIsFull():number {
        for(let i = 0; i < this._actor._data.equipment_name_list.length; i++) {
            if (this._actor._data.equipment_name_list[i].length <= 0) return i;
        }
        return -1;
    }

    public pickedItem(name:string):boolean {

        var index = this.checkIsFull();
        if (index === -1) return false;

        this._actor._data.equipment_name_list[index] = name;
        let bagItems = this._actor._data.items[name];

        if (bagItems === undefined) {
            this.createItem(name);
        }else{
            this.getSameItem(bagItems);
        }

        return true;
    }

    public dropItem():boolean {

        const curIndex = this._actor._data.current_equipment_index;
        const data = this._actor._data.equipment_name_list;
        if (curIndex !== -1) {
            this._actor._actorEquipment?.unEquip();
            const name = data[curIndex];
            this._actor._data.items[name] = undefined;
            const pos = this._actor.node.worldPosition;
            Level.Instance.addDrop(name, pos);
            data[curIndex] = '';
            this._actor._data.current_equipment_index = -1;
            return true;
        }
        return false;
    }

    public createItem(name:string) {

        const bagData = DataEquipInst.get(name);

        let state = {
            'bulletCount':bagData.bullet_count
        }

        let newItems = {
            'name':name,
            'actor':this._actor,
            'stackable':bagData.stackable === undefined ? false : true,
            'count':1,
            'data':bagData,
            'bulletCount': bagData.bullet_count,
            'lastUseTime': game.totalTime,
            'state':[state]
        }

        this._actor._data.items[name] = newItems;

    }

    public getSameItem(bagItems:BagItems) {
        
        if (bagItems.stackable === true) {
            bagItems.count++;
            let state = {
                'bulletCount':bagItems.data.bullet_count 
            }
            bagItems.state.push(state);
        }
    }

}

export interface BagItems {
    fov: number;
    name:string,
    actor:Actor,
    stackable:boolean,
    count:number,
    bulletCount:number,
    data:any,
    lastUseTime:number,
    state:[BagItemState]

}

export interface BagItemState {
    bulletCount:number,
}
