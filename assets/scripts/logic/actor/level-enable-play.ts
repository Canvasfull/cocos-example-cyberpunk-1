import { _decorator, Component, animation } from 'cc';
import { Level } from '../level/level';
import { Game } from '../data/game';
const { ccclass, property } = _decorator;

@ccclass('LevelEnablePlay')
export class LevelEnablePlay extends Component {

    onEnable() {
        if (Game.Instance._currentGameNodeName !== 'level') {
            this.node.getComponent(animation.AnimationController)!.enabled = false;
        }
    }
}

