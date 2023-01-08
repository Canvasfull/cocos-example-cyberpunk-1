import { _decorator, Component, Node, v3, AudioSource, math, ParticleSystem, PhysicsSystem, geometry } from 'cc';
import { Sound } from '../../core/audio/sound';
import { fx_group } from '../../core/effect/fx-group';
import { UtilVec3 } from '../../core/util/util';
import { Actor } from './actor';
const { ccclass, property } = _decorator;

@ccclass('ActorPushBox')
export class ActorPushBox extends Component {

    @property
    pushAnimationName = '';

    _actor:Actor;

    velocity = v3(0, 0, 0);

    _audio:AudioSource;

    sound_res = 'sfx_push_wooden_box';

    _volume = 0;

    _ray: geometry.Ray = new geometry.Ray();

    start() {

        this._actor = this.getComponent(Actor);
        this._audio = this.addComponent(AudioSource);

        Sound.getClip(this.sound_res, (clip)=>{
            this._audio.clip = clip;
            this._audio.stop();
        });

    }

    update(deltaTime: number) {

        this._actor._rigid.getLinearVelocity(this.velocity);
        var v_length = this.velocity.length();

        if (this._actor._data.is_sokoban && v_length > 0.05) {
            this._actor._animationGraph.play(this.pushAnimationName, true);
            if (!this._audio.loop) {
                this._audio.play();
                this._audio.loop = true;
            }
        }else{
            if (this._audio.loop) {
                this._audio.loop = false;
            }
            this._actor._animationGraph.play(this.pushAnimationName, false);
        }

        var volume = Sound.volume * v_length * 2;
        if (volume > 1) volume = 1;
        this._audio.volume = math.lerp(this._audio.volume, volume, deltaTime);
 
    }

    checkPushBox():boolean {

        
        this._actor._rigid.getLinearVelocity(this.velocity);
        if (Math.abs(this.velocity.y) > 0.1) return false;

        UtilVec3.copy(this._ray.d, this._actor._dir);
        
        if (!this._actor._data.is_ground) return false;
        const mask = (1 << 0);
        UtilVec3.copy(this._ray.o, this.node.worldPosition);
        this._ray.o.y += 0.5;
        if (PhysicsSystem.instance.raycastClosest(this._ray, mask, 1)) {
            var res = PhysicsSystem.instance.raycastClosestResult;
            if (res.collider.name.includes('wooden_box1')) {
                return true;
            }
        }
        return false;

    }
}

