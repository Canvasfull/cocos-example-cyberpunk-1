
import { _decorator, Component, find, Vec2, PhysicsSystem, input, Input, EventMouse, geometry, Camera, game, EventTouch, director, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { IActorInput } from '../../core/input/IActorInput';
import { Level } from '../level/level';
import { Save } from '../../core/data/save';
import { Msg } from '../../core/msg/msg';
import { ActorEnemy } from './actor-enmey';


@ccclass('ActorInputBrain')
export class ActorInputBrain extends Component implements IActorInput {

    _actor:IActorInput = null;

    _isPause = false;

    start () {
        this._actor = this.getComponent(ActorEnemy)
    }

    onMove(move:Vec3) {
        this._actor?.onMove(move);
    }

    onRotation(x:number, y:number){
        this._actor?.onRotation(x, y);
    }

    onDir(x:number, y:number) {
        this._actor?.onDir(x, y);
    }

    onJump() {
        this._actor?.onJump();
    }

    onRun(isrun:boolean) {
        this._actor?.onRun(isrun);
    }

    onCrouch() {
        this._actor?.onCrouch();
    }

    onProne(){
        this._actor?.onProne();
    }

    onFire() {
        this._actor?.onFire();
    }

    onEquip(index:number) {
        this._actor?.onEquip(index);
    }

    onPick() {
        this._actor?.onPick();
    }

    onReload() {
        this._actor?.onReload();
    }

    onDrop() {
        this._actor?.onDrop();
    }

    onPasue() {

        this._isPause = !this._isPause;

        if(this._isPause) {
            console.log('push level pause');
            Msg.emit('push', 'levelpause');
        }else{
            Msg.emit('back');
            console.log('back level pasue.')
        }

    }
    

}