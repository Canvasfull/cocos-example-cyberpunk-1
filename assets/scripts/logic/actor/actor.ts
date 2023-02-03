import { _decorator, Vec3, v3, game, Node, math } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { IActorInput } from '../../core/input/IActorInput';
import { Local } from '../../core/localization/local';
import { Msg } from '../../core/msg/msg';
import { UtilNode } from '../../core/util/util';
import { ActorAnimationGraph } from './actor-animation-graph';
import { ActorBag } from './actor-bag';
import { ActorEquipment } from './actor-equipment';
import { ActorSensorDropItem } from './actor-sensor-drop-item';
import { ActorMove } from './actor-move';
import { SensorGround } from '../../core/sensor/sensor-ground';
const { ccclass } = _decorator;

let tempLinearVelocity = v3(0, 0, 0);
let tempAngleVelocity = v3(0, 0, 0);

@ccclass('Actor')
export class Actor extends ActorBase implements IActorInput {

    _move = v3(0, 0, 0);
    _actorBag: ActorBag | undefined;
    _actorEquipment: ActorEquipment | undefined;
    _actorSensorDropItem: ActorSensorDropItem | undefined;
    _actorSensorGround: SensorGround | undefined;
    _actorMove: ActorMove | undefined;
    _viewNoWeapon:Node = Object.create(null);
    _forwardNode:Node | undefined;
    _viewRoot:Node | undefined;
    _fps = 0; 

    isReady = false;

    get noAction () {
        return this._data.is_dead || this._data.is_win;
    }

    initView() {

        super.initView();

        this._actorBag = new ActorBag(this);
        this._actorEquipment = new ActorEquipment(this);
        this._actorSensorDropItem = this.node.getComponentInChildren(ActorSensorDropItem)!;
        this._actorSensorGround = this.node.getComponent(SensorGround)!;
        this._actorMove = this.getComponent(ActorMove)!;
        this._forwardNode = UtilNode.find(this.node, 'forwardNode');
        this._viewRoot = UtilNode.find(this.node, 'animation_view');
        this._animationGraph = this._viewRoot.getComponent(ActorAnimationGraph)!;

        this.do('play');
    }

    onUpdate () {
        super.onUpdate();
        this._updates.push(this.updateAction.bind(this));
    }

    do (name: string) {
        if (this.noAction) return;
        super.do(name);
    }

    updateAction (deltaTime: number) {

        if(this._data.hit_recover > 0) {
            this._data.hit_recover -= deltaTime;
            this._actorMove?.stop();
        }

        this._fps = game.frameRate as number;

        // Check run strength
        const canRun = this.calculateRunStrength(deltaTime);
        this._actorMove!.speed = canRun ? -this._data.run_speed.z :  -this._data.move_speed.z;
        const normalizeSpeed = Math.abs(this._actorMove!.velocity.length() / this._actorMove!.speed);
        this._actorEquipment?.updateAim(normalizeSpeed);
        this.recoverStrength();
    }

    onJump () {

        if(this._actorSensorGround!._isGround === false) return;
        
        if (this._data.strength >= this._data.cost_jump_strength) {
            this._data.strength -= this._data.cost_jump_strength;
        }
        
        this.do('jump');
    }

    onGround () {
        this.do('on_ground');
    }

    offGround () {
        this.do('off_ground');
    }

    onWin () { }

    jump () {
        this._actorMove?.jump();
    }

    onMove (move: Vec3) {
        this._actorMove?.moveDirection(move); 
    }

    onRotation (x: number, y: number) { this._actorMove?.onRotation(x, y); }

    onDir(x: number, z:number) {
        this._dir.z = z;
        this._dir.x = x;
    }
    
    onPause() {}

    onRun(isRun:boolean) { this._data.is_run = isRun; }

    onPick() {

        var pickedNode = this._actorSensorDropItem?.getPicked();

        if (pickedNode !== undefined) {
            if (this._actorBag?.pickedItem(pickedNode.name)) {
                pickedNode.emit('picked');
                Msg.emit(
                    'msg_tips', 
                    `${Local.Instance.get('picked')}  ${pickedNode.name}  x 1`
                );
                Msg.emit('msg_update_bag');
            }else{
                Msg.emit(
                    'msg_tips', 
                    `${Local.Instance.get('bag_is_full')}`
                );
            }
        }

    }

    onDrop() {
        if (this._actorBag?.dropItem()) {
            Msg.emit('msg_update_bag');
        }
    }

    onCrouch() {

        this._data.is_crouch = this._data.is_crouch ? false : true;

        // set view height.
        // set physic collider height.
        // set hit part height.
        this._animationGraph?.play('bool_crouch', this._data.is_crouch);
        Msg.emit('msg_change_tps_camera_height', this._data.is_crouch ? this._data.stand_camera_height : this._data.crouch_camera_height);

    }

    onAim() {
        this._data.is_aim = this._data.is_aim ? false : true;
        this.do(this._data.is_aim ? 'on_aim': 'off_aim');
        
        if(this.isPlayer) Msg.emit('msg_change_tps_camera_target', this._data.is_aim? 1 : 0);
    }
    
    onFire() {
        const canUseEquip = this.calculateStrengthUseEquip();
        if (canUseEquip) {
            this._actorEquipment?.do('fire');
            this._actorEquipment?.updateAim(1, true);
        }
    }

    onReload() {
        this._actorEquipment?.do('reload');
    }

    onEquip(index:number) {

        if (this._actorEquipment?.equip(index)) {
            if(this._data.has_multi_res) this._viewNoWeapon.active = false;
        }else{
            if(this._data.has_multi_res) this._viewNoWeapon.active = true;
        }
    }

    onChangeEquips(): boolean { return false; }

    calculateStrengthUseEquip():boolean {
        
        const canUseEquip = this._data.strength >= this._data.cost_use_equip_strength;
        if (canUseEquip) {
            this._data.strength -= this._data.cost_use_equip_strength;
            this._data.strength = Math.max(this._data.strength, 0);
        }

        return canUseEquip;
    }

    calculateRunStrength(deltaTime:number):boolean {
        const canRun = this._data.is_run && this._data.strength >= this._data.cost_run_strength;
        if (canRun) {
            this._data.strength -= this._data.cost_run_strength * deltaTime;
            this._data.strength = Math.max(this._data.strength, 0);
        }
        return canRun;
    }

    recoverStrength () {
        if (this._data.is_ground === false) return;
        if (this._data.is_run) return;

        this._data.strength += this._data.recover_ground_strength * game.deltaTime;
        if(this._data.strength > this._data.max_strength) this._data.strength = this._data.max_strength;
        const percent_value = this._data.strength / this._data.max_strength;

        if(this.isPlayer) Msg.emit('fil_strength', percent_value);
    }

    lateUpdate(deltaTime:number) {

        if(this._actorMove == undefined) return;

        // Synchronize animation setup data.
        const rigidBody = this._actorMove?.rigid;
        rigidBody!.getLinearVelocity(tempLinearVelocity);

        tempLinearVelocity.y = 0;
        const linearVelocityLength = tempLinearVelocity.length();
        const eulerAnglesY = this.node.eulerAngles.y;

        //rotate y.
        Vec3.rotateY(tempLinearVelocity, tempLinearVelocity, Vec3.ZERO, math.toRadian(-eulerAnglesY));

        let num_velocity_x = tempLinearVelocity.x;
        let num_velocity_y = tempLinearVelocity.z;

        let moveSpeed = linearVelocityLength * this._data.linear_velocity_animation_rate;

        // Check rotation.
        const angleSpeed = this._actorMove!.angle;
        if(linearVelocityLength < 0.01 && angleSpeed > 2) {
            moveSpeed = angleSpeed * this._data.angle_velocity_animation_rate;
            num_velocity_x = angleSpeed/ this._data.angle_velocity_animation_scale;
        }
        
        this._animationGraph?.setValue('num_velocity_x', num_velocity_x);
        this._animationGraph?.setValue('num_velocity_y', -num_velocity_y);
        this._animationGraph?.setValue('num_move_speed', moveSpeed);
    } 

}