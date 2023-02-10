import { DataEquip } from "../../logic/data/data-equip";
import { DataSound } from "../../logic/data/data-sound";
import { DataCamera } from "./data-camera";
import { DataGame } from "./data-game";
import { DataLevel } from "./data-level";
import { DataNavigation } from "./data-navigation";
import { DataUpgradeCard } from "./data-upgrade-card";

export const DataEquipInst = new DataEquip();
export const DataSoundInst = new DataSound();
export const DataCameraInst = new DataCamera();
export const DataNavigationInst = new DataNavigation();
export const DataUpgradeCardInst = new DataUpgradeCard();
export const DataGameInst = new DataGame();
export const DataLevelInst = new DataLevel();

export function Init() {
    //Init data.
    DataEquipInst.init('data-equips');
    DataSoundInst.init('data-sound');
    DataCameraInst.init('data-camera');
    DataNavigationInst.init('data-navigation');
    DataUpgradeCardInst.init('data-upgrade-card');
    DataGameInst.init('data-game');
    DataLevelInst.init('data-level');
}