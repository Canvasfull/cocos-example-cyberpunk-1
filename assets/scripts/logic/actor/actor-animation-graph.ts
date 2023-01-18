
import { _decorator, Component, Node, animation, Vec3, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ActorAnimationGraph')
export class ActorAnimationGraph extends Component {

    _graph: animation.AnimationController | undefined | null;
    //_actor: Actor = Object.create(null);

    start () {
        // [3]
        this._graph = this.getComponent(animation.AnimationController);
        //this._actor = this.node.parent.parent.getComponent(Actor);

        if (this._graph === undefined || this._graph === null) {
            throw new Error(`${this.node.name} can not find AnimationController`);
        }
    }

    play (key: string, value: boolean | number) {
        this._graph?.setValue(key, value);
    }

    setValue(key:string, value:number) {
        this._graph?.setValue(key, value);
    }

    update (deltaTime: number) {
        //     // [4]
        //this.play('speed', this._actor._data.cur_speed);
        //this.play('move_speed', this._actor._data.cur_speed + 0.5);
        //this.play('is_ground', this._actor._data.is_ground);
    }
}
