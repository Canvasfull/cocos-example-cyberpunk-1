import { _decorator, Component, Node, animation, CCFloat, CCString } from "cc";
import { Msg } from "../../core/msg/msg";
const { ccclass, property } = _decorator;

@ccclass("AnimationGraphMove")
export class AnimationGraphMove extends animation.StateMachineComponent {


    @property
    time = 0.5;

    @property
    msg = 'msg_walk_sfx';

    _triggered: boolean = false;

    /**
     * Called right after a motion state is entered.
     * @param controller The animation controller it within.
     * @param motionStateStatus The status of the motion.
     */
    public onMotionStateEnter (controller: animation.AnimationController, motionStateStatus: Readonly<animation.MotionStateStatus>): void {
        // Can be overrode
    }

    /**
     * Called when a motion state is about to exit.
     * @param controller The animation controller it within.
     * @param motionStateStatus The status of the motion.
     */
    public onMotionStateExit (controller: animation.AnimationController, motionStateStatus: Readonly<animation.MotionStateStatus>): void {
        // Can be overrode
        this._triggered = false;
    }

    /**
     * Called when a motion state updated except for the first and last frame.
     * @param controller The animation controller it within.
     * @param motionStateStatus The status of the motion.
     */
    public onMotionStateUpdate (controller: animation.AnimationController, motionStateStatus: Readonly<animation.MotionStateStatus>): void {
        // Can be overrode
        if (motionStateStatus.progress > this.time && !this._triggered) {
            // 触发事件
            this._triggered = true;
            Msg.emit(this.msg);
        } else if (motionStateStatus.progress < this.time && this._triggered) {
            this._triggered = false;
        }

    }

    /**
     * Called right after a state machine is entered.
     * @param controller The animation controller it within.
     */
    public onStateMachineEnter (controller: animation.AnimationController) {
        // Can be overrode
    }

    /**
     * Called right after a state machine is entered.
     * @param controller The animation controller it within.
     */
    public onStateMachineExit (controller: animation.AnimationController) {
        // Can be overrode
    }

}
