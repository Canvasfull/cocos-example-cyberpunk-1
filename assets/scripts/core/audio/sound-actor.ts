import { _decorator, Component, Node } from 'cc';
import { Sound } from './sound';
const { ccclass, property } = _decorator;

@ccclass('SoundActor')
export class SoundActor extends Component {

    @property(String)
    sfx_name: string | undefined;

    onEnable () {
        Sound.addSfx(this.node, this.sfx_name!);
    }
}
