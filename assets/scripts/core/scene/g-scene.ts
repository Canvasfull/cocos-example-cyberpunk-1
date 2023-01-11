import { Director, director, Scene } from "cc";
import { Msg } from "../msg/msg";
import { ILoadMsg } from "../../logic/ui/ui-loading";

export class GScene {

    public static isLoadScene = false;

    public static isPreload = false;

    public static msg:ILoadMsg = {
        id:100,
        action:'load scene',
        current:'',
        wait_count:1,
        count:1,
    }


    public static Load(name: string, onload: () => void) {
        GScene.isLoadScene = true;
        Msg.emit('pool_recycle');

        this.msg.current = name;
        this.msg.wait_count = 1;
        this.msg.count = 1;
        Msg.emit('msg_loading',this.msg);

        director.loadScene(name, (error: Error | null, scene?: Scene) => {
            if(error) {
                throw new Error(`Load Scene Error.`);
            }
            if (scene) {
                onload();
                GScene.isLoadScene = false;
                this.msg.count--;
            } else {
                console.warn('Can not load scene. - ' + name);
            }
        });
    }

}