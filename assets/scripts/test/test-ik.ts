import { _decorator, Component, EventKeyboard, Input, input, KeyCode, Node } from 'cc';
import { ActorAnimationGraphGroup } from '../logic/actor/actor-animation-graph-group';
import { ActorAnimationGraph } from '../logic/actor/actor-animation-graph';
import AimControl from '../core/ik/aim-control';
const { ccclass, property } = _decorator;

@ccclass('TestIk')
export class TestIk extends Component {

    @property(Node)
    anim:Node | undefined;

    @property(Node)
    targetRoot:Node | undefined;

    @property(Node)
    ikNode:Node | undefined;

    @property(Node)
    target:Node | undefined;

    aimControl:AimControl | undefined;

    animationGraph:ActorAnimationGraph | undefined | null;

    targetIndex = 0;

    bool_iron_sights = false;
    

    start() {

        this.aimControl = this.ikNode?.getComponent(AimControl)!;

        this.animationGraph = this.anim?.getComponent(ActorAnimationGraph);

        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);
    }

    keyDown(event: EventKeyboard) {

        if(event.keyCode === KeyCode.KEY_I) {
            this.bool_iron_sights = this.bool_iron_sights ? false : true;
            this.animationGraph?.play('bool_iron_sights', this.bool_iron_sights);
            console.log('bool_iron_sights:', this.bool_iron_sights);
        }

        if (event.keyCode === KeyCode.KEY_F) {
            this.animationGraph?.play('trigger_fire', true);
        }

        if (event.keyCode === KeyCode.KEY_N) {
            this.nextTarget();
        }

        if (event.keyCode === KeyCode.KEY_R) {
            this.animationGraph!.play('trigger_reload', true);
        }

        if (event.keyCode === KeyCode.KEY_E) {
            this.animationGraph!.play('trigger_reload_empty', true);
        }

        if (event.keyCode === KeyCode.KEY_H) {
            this.animationGraph!.play('trigger_holster', true);
        }

        if (event.keyCode === KeyCode.SPACE) {
            this.animationGraph!.play('trigger_jump', true);
        }
        
    }

    nextTarget() {
        const worldPosition = this.targetRoot!.children[this.targetIndex].getWorldPosition();
        this.aimControl!.target?.setWorldPosition(worldPosition);
        this.target?.setWorldPosition(worldPosition);
        console.log('current target index:', this.targetIndex);
        this.targetIndex++;
        if(this.targetIndex >= this.targetRoot!.children.length) this.targetIndex = 0;
    }

}

