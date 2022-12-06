import { Vec3 } from "cc"

export interface IActorInput {
    onMove(move:Vec3);
    onRotation(x:number, y:number);
    onDir(x:number, y:number);
    onJump();
    onCrouch();
    onProne();
    onFire();
    onReload();
    onPick();
    onDrop();
    onRun(isRun:boolean);
    onEquip(index:number);
    onPause();
}