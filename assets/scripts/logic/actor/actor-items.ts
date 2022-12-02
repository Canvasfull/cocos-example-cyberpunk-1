import { Component, _decorator } from "cc";
import { BagItems } from "./actor-bag";
import { IActorEquip } from "./actor-interface";

const { ccclass } = _decorator;

@ccclass('ActorItem')
export class ActorItem extends Component {

    data:BagItems | undefined;

    item:IActorEquip;

    start() {

    }

}