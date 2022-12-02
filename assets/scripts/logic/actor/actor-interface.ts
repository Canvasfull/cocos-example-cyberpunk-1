export interface IActorEquip {

    onUse();
    onDrop();
    onPick();

}

export class DamageData {
    hitPart:string;
    hitDistance:number;
    fireData:any;
}