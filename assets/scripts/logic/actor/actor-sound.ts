import { _decorator, Component, Node, game } from 'cc';
import { Sound } from '../../core/audio/sound';
import { Msg } from '../../core/msg/msg';
import { Actor } from './actor';
const { ccclass } = _decorator;

@ccclass('ActorSound')
export class ActorSound extends Component {

    actor: Actor;

    init (actor: Actor) {
        this.actor = actor;
        Msg.on('msg_walk_sfx', this.walkSfx.bind(this));
    }

    onDestroy () {
        Msg.off('msg_walk_sfx', this.walkSfx.bind(this));
    }

    walkSfx (name: string) {

        var data = this.actor._data;
        if(data.cur_speed < 0.1) return;
        if (data.is_ingrass) {
            Sound.on(data.sfx_walk_grass, data.cur_speed);
        } else {
            Sound.on(data.sfx_walk_ground, data.cur_speed);
        }
    }

}

