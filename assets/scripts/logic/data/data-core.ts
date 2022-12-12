import { DataEquip } from "../../logic/data/data-equip";
import { DataSound } from "../../logic/data/data-sound";
import { DataCamera } from "./data-camera";


export const DataEquipInst = new DataEquip();
export const DataSoundInst = new DataSound();
export const DataCameraInst = new DataCamera();

export function Init() {
    //Init data.
    DataEquipInst.init('data-equips');
    DataSoundInst.init('data-sound');
    DataCameraInst.init('data-camera');
}