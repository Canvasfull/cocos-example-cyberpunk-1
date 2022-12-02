import { _decorator, Component, animation } from 'cc';
import { Level } from '../level/level';
import { Game } from './../../core/data/game';
const { ccclass, property } = _decorator;

@ccclass('level_enable_play')
export class level_enable_play extends Component {

    onEnable() {
        if(Game.Instance._cur_name != 'level') {
            this.node.getComponent(animation.AnimationController).enabled = false;
        }
    }
}

