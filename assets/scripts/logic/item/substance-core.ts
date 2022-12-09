import { _decorator, Component, Node } from 'cc';
import { Singleton } from '../../core/pattern/singleton';
const { ccclass, property } = _decorator;

@ccclass('SubstanceCore')
export class SubstanceCore extends Singleton {

    public checkNodeType(node:Node):string {
        for (let substanceType in SubstanceType) {
            if(node.name.includes(substanceType)) {
                return substanceType;
            }
        }
        return SubstanceType.GROUND;

    }

}


export enum SubstanceType {

    None = 'none',
    GROUND = 'ground',
    METAL = 'metal',
    WALL = 'wall',
    WATER = 'water'

}
