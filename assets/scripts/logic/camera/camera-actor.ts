import { _decorator, Component, Node, Game } from 'cc';
import { Msg } from '../../core/msg/msg';
import { actor_main } from '../actor/actor-main';
import { CameraController } from './camera-controller';
import { SmoothLocalZ } from './smooth-local-z';
const { ccclass, property } = _decorator;

@ccclass('CameraActor')
export class CameraActor extends Component {

    controller:CameraController;
    actor_main:actor_main;
    smooth:SmoothLocalZ;

    isload = false;

    start() {

        this.controller = this.node.getComponent(CameraController);
        this.actor_main = this.node.getComponent(actor_main);
        this.smooth = this.node.children[0].children[0].getComponent(SmoothLocalZ);
        this.smooth.init();

        this.enable_actor = this.enable_actor.bind(this);
        Msg.on('enable_camera_actor', this.enable_actor.bind(this));

    }

    onDestroy() {
        Msg.off('enable_camera_actor', this.enable_actor);
    }

    enable_actor() {
        this.controller.enabled = true;
        this.actor_main.enabled = true;
        this.smooth.enabled = true;
    }

    update (deltaTime: number) {

        if(this.isload) return;

    }
}

