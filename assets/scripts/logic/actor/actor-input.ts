
import { _decorator, Component, find, Vec2, PhysicsSystem, input, Input, EventMouse, geometry, Camera, game, EventTouch, director, Vec3, sys } from 'cc';
const { ccclass, property } = _decorator;
import { IActorInput } from '../../core/input/IActorInput';
import { Level } from '../level/level';
import { Save } from '../data/save';
import { Msg } from '../../core/msg/msg';

@ccclass('ActorInput')
export class ActorInput extends Component implements IActorInput {

    _actor:IActorInput | undefined | null;
    _isPause = false;

    _isOpenEquips = false;

    start () {
        this._actor = Level.Instance._player;
        if(sys.platform === sys.Platform.MOBILE_BROWSER || 
            sys.platform === sys.Platform.ANDROID || 
            sys.platform === sys.Platform.IOS ) {
            this.node.children[1].active = true;
        }else {
            this.node.children[2].active = true;
            this.node.children[0].active = true;
        }
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

    onDir(x: number, y: number) {
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

    onChangeEquips() {
        this._isOpenEquips = !this._isOpenEquips;
        if(this._isOpenEquips)
            Msg.emit('push', 'select_equips');
        else
            Msg.emit('back');

        return this._isOpenEquips;
    }
    

}