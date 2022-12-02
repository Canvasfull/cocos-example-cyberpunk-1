
import { _decorator, Component, find, Vec2, PhysicsSystem, input, Input, EventMouse, geometry, Camera, game, EventTouch, director, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { IActorInput } from '../../core/input/IActorInput';
import { Level } from '../level/level';
import { Save } from '../../core/data/save';
import { Msg } from '../../core/msg/msg';

/**
 * Predefined variables
 * Name = actor-input
 * DateTime = Fri Jan 21 2022 15:09:30 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = actor-input.ts
 * FileBasenameNoExtension = actor-inpu
 * URL = db://assets/scripts/logic/actor/actor-input.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('ActorInput')
export class ActorInput extends Component implements IActorInput {

    _actor:IActorInput = null;

    _isPause = false;

    start () {
        this._actor = Level.Instance.actor;
        var input_index = Save.Instance.get('input_index');
        input_index = 0;
        this.node.children[input_index].active = true;
        console.log('init actor input:', input_index);
    }

    onMove(move:Vec3) {
        this._actor?.onMove(move);
    }

    onRotation(x:number, y:number){
        this._actor?.onRotation(x, y);
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