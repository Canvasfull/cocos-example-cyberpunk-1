import { Component, _decorator } from "cc";
import { BagItem } from "./actor-bag";
import { IActorEquip } from "./actor-interface";

const { ccclass } = _decorator;

@ccclass('ActorItem')
export class ActorItem extends Component {

    data:BagItem | undefined;
    item:IActorEquip | undefined;

    start() {

    }

}