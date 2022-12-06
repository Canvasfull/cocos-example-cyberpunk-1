import { Director, director, Scene } from "cc";
import { Msg } from "../msg/msg";

export class GScene {

    public static isLoadScene = false;

    public static isPreload = false;

    public static Load(name: string, onload: () => void) {
        GScene.isLoadScene = true;
        Msg.emit('pool_recycle');
        director.loadScene(name, (err: Error, scene?: Scene) => {
            if (scene) {
                //onload();
                GScene.isLoadScene = false;
            } else {
                console.warn('Can not load scene. - ' + name);
            }
        });
    }

}