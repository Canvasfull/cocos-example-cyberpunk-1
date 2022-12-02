import { Director, director, Scene } from "cc";
import { Msg } from "../msg/msg";

export class GScene {

    public static isloadScene = false;

    public static isPreload = false;

    public static Load(name: string, onload: () => void) {
        GScene.isloadScene = true;
        Msg.emit('pool_recycle');
        director.loadScene(name, (err: Error, scene?: Scene) => {
            if (scene) {
                //onload();
                GScene.isloadScene = false;
            } else {
                console.warn('Can not load scene. - ' + name);
            }
        });
    }

}