
import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ActorAnimatorController')
export class ActorAnimatorController extends Component {

    _anim:SkeletalAnimation = Object.create(null);
    _data = Object.create(null);

    init(_data) {
        this._data = _data;
        this._anim = this.getComponent(SkeletalAnimation);
    }

    play(name: string) {
        var anims = this._data[name];
        this._anim.play(anims[0]);
    }
    
}
