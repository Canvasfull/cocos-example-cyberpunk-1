import { _decorator, Component, EventKeyboard, EventMouse, Input, input, KeyCode, math, Node, RigidBody, v3, Vec3 } from 'cc';
import { ActorAnimationGraph } from '../logic/actor/actor-animation-graph';
import { Msg } from '../core/msg/msg';
const { ccclass, property } = _decorator;

@ccclass('TestAmoyAnimation')
export class TestAmoyAnimation extends Component {

    _animationGraph:ActorAnimationGraph | undefined;

    bool_crouch = false;

    bool_iron_sights = false;

    direction_up = 0;
    direction_down = 0;
    direction_left = 0;
    direction_right = 0;

    cameraTargetIndex = 0;

    @property
    moveSpeedRate = 0.7;

    @property
    angleSpeedRate = 0.3;

    angleVelocity = v3(0, 0, 0);

    linearVelocity = v3(0, 0, 0);
    moveSpeed = 1;

    @property(Node)
    view:Node | undefined;

    @property(RigidBody)
    targetRigid:RigidBody | undefined;

    start() {
        this._animationGraph = this.view?.getComponent(ActorAnimationGraph)!;
        input.on(Input.EventType.KEY_DOWN, this.keyDown, this);
        input.on(Input.EventType.KEY_UP, this.keyUp, this);

        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    }

    lateUpdate(deltaTime: number) {
        this.updateMove();
    }

    keyDown(event: EventKeyboard) {

        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP) this.direction_up = -1;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN) this.direction_down = 1; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = -1;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 1;
        
        if(event.keyCode == KeyCode.KEY_I) {
            this.bool_iron_sights = this.bool_iron_sights ? false : true;
            console.log(this.bool_iron_sights);
            this._animationGraph?.play('bool_iron_sights', this.bool_iron_sights);
            this.cameraTargetIndex = this.bool_iron_sights? 1 : 0;
            Msg.emit('msg_change_tps_camera_target', this.cameraTargetIndex);
        }

        if(event.keyCode == KeyCode.KEY_C) {
            this.bool_crouch = this.bool_crouch ? false : true;
            this._animationGraph?.play('bool_crouch', this.bool_crouch);
            Msg.emit('msg_change_tps_camera_height', this.bool_crouch ? 1 : 1.377);
        }

        if(event.keyCode == KeyCode.SPACE) {
            this._animationGraph?.play('trigger_jump', true);
            this._animationGraph?.setValue('num_jump_speed', 0.8);
        }

        if(event.keyCode === KeyCode.KEY_D) {
            this._animationGraph?.play('trigger_draw', true);
        }

        if (event.keyCode === KeyCode.KEY_R) {
            this._animationGraph?.play('trigger_reload', true);
        }

        if (event.keyCode === KeyCode.KEY_E) {
            this._animationGraph?.play('trigger_reload_empty', true);
        }

        if (event.keyCode === KeyCode.KEY_H) {
            this._animationGraph?.play('trigger_hit', true);
        }

        if (event.keyCode == KeyCode.KEY_Z) {

            if(this.cameraTargetIndex === 1) return;

            this.cameraTargetIndex = this.cameraTargetIndex === 0 ? 2 : 0;
            
            Msg.emit('msg_change_tps_camera_target', this.cameraTargetIndex);
        }

        //this.updateMove();

    }

    onMouseDown(event: EventMouse) {
        this._animationGraph?.play('trigger_fire', true);
    }

    keyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP)  this.direction_up = 0;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN)  this.direction_down = 0; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = 0;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 0;
        //this.updateMove();
    }

    updateMove() {

        this.targetRigid!.getLinearVelocity(this.linearVelocity);
        this.targetRigid!.getAngularVelocity(this.angleVelocity);

        this.linearVelocity.y = 0;
        const linearVelocityLength = this.linearVelocity.length();

        const eulerAnglesY = this.targetRigid!.node.eulerAngles.y;

        //rotate y.
        Vec3.rotateY(this.linearVelocity, this.linearVelocity, Vec3.ZERO, math.toRadian(-eulerAnglesY));

        let num_velocity_x = this.linearVelocity.x;
        let num_velocity_y = this.linearVelocity.z;

        this.moveSpeed = linearVelocityLength * this.moveSpeedRate;

        // Check rotation.
        if((this.direction_up + this.direction_left + this.direction_right + this.direction_down) == 0 && Math.abs(this.angleVelocity.y) > 1) {
            this.moveSpeed = this.angleVelocity.y * this.angleSpeedRate;
            num_velocity_x = this.angleVelocity.y / 10;
        }
        
        this._animationGraph?.setValue('num_velocity_x', num_velocity_x);
        this._animationGraph?.setValue('num_velocity_y', -num_velocity_y);
        this._animationGraph?.setValue('num_move_speed', this.moveSpeed);
    }

}

