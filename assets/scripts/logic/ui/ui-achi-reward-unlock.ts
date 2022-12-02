import { _decorator, Component, Node } from 'cc';
import { Game } from '../../core/data/game';
import { Save } from '../../core/data/save';
const { ccclass, property } = _decorator;

@ccclass('ui_achi_reward_unlock')
export class ui_achi_reward_unlock extends Component {

    onEnable() {
        var savedata = Save.Instance._cur;
        if(savedata.maps[Game.Instance._data.unlock_code_level].score > 0) {
            this.node.active = false;
        }
    }
}

