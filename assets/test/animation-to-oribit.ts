import { _decorator, Component, Node, Animation, Quat, Vec3, input, Input } from 'cc';
import OrbitCamera from '../../extensions/pipeline/pipeline/utils/orbit-camera';
const { ccclass, property } = _decorator;

let tempQuat = new Quat

@ccclass('animation_to_oribit')
export class animation_to_oribit extends Component {
    @property(Animation)
    ani: Animation | undefined
    @property(OrbitCamera)
    orbit: OrbitCamera | undefined

    start () {
        // this.ani = this.getComponent(Animation)
        // this.orbit = this.getComponent(OrbitCamera)

        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    touched = false;
    timeoutID = undefined;
    onTouchStart () {
        if (!this.orbit || !this.ani) {
            return;
        }
        this.touched = true;
        if (this.timeoutID) {
            clearTimeout(this.timeoutID)
        }
        this.ani.enabled = false;
        this.orbit.enabled = true;
    }
    onTouchEnd () {
        if (!this.orbit || !this.ani) {
            return;
        }
        this.orbit.enabled = false;
        this.timeoutID = setTimeout(() => {
            this.touched = false;
            this.ani.enabled = true;
            this.timeoutID = undefined;
        }, 1000)
    }

    update (dt: number) {
        if (this.orbit && !this.touched) {
            Quat.slerp(tempQuat, this.orbit.node.rotation, Quat.IDENTITY, dt * 7);
            this.orbit.node.rotation = tempQuat
        }

    }
}


