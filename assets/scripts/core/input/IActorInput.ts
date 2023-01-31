import { Vec3 } from "cc"

export interface IActorInput {
    onMove(move:Vec3):void;
    onRotation(x:number, y:number):void;
    onDir(x:number, y:number):void;
    onJump():void;
    onCrouch():void;
    onFire():void;
    onReload():void;
    onPick():void;
    onDrop():void;
    onRun(isRun:boolean):void;
    onEquip(index:number):void;
    onPause():void;
    onChangeEquips():boolean;
}