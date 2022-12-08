
import { _decorator, Component, find, Vec2, PhysicsSystem, input, Input, EventMouse, geometry, Camera, game, EventTouch, director, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { IActorInput } from '../../core/input/IActorInput';
import { Level } from '../level/level';
import { Save } from '../../core/data/save';
import { Msg } from '../../core/msg/msg';
import { ActorEnemy } from './actor-enemy';


@ccclass('ActorInputBrain')
export class ActorInputBrain extends Component implements IActorInput {

    _actor:IActorInput | undefined | null;

    _isPause = false;

    start () {
        this._actor = this.getComponent(ActorEnemy);
        if (this._actor === null) {
            throw new Error(`${this.node.name} node can not find ActorEnemy`);
        }
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

    onRun(isRun:boolean) {
        this._actor?.onRun(isRun);
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

    onPause() {

        this._isPause = !this._isPause;

        if (this._isPause) {
            console.log('push level pause');
            Msg.emit('push', 'level_pause');
        }else{
            Msg.emit('back');
            console.log('back level pause.')
        }

    }
    

}