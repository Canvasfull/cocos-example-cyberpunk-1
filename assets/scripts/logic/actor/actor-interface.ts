export interface IActorEquip {

    onUse();
    onDrop();
    onPick();

}

export class DamageData {
    hitPart:string | undefined;
    hitDistance:number | undefined;
    fireData:any;
}