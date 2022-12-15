
import { _decorator, RigidBody, Vec3, v3, game, Node, math } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Guide } from '../../core/guide/guide';
import { IActorInput } from '../../core/input/IActorInput';
import { Local } from '../../core/localization/local';
import { Msg } from '../../core/msg/msg';
import { Res } from '../../core/res/res';
import { u3, UtilNode } from '../../core/util/util';
import { Level } from '../level/level';
import { ActorAnimationGraph } from './actor-animation-graph';
import { ActorBag } from './actor-bag';
import { ActorBuff } from './actor-buff';
import { ActorEquipment } from './actor-equipment';
import { ActorSensorDropItem } from './actor-sensor-drop-item';
import { ActorSound } from './actor-sound';
const { ccclass } = _decorator;

@ccclass('Actor')
export class Actor extends ActorBase implements IActorInput {

    _velocity = v3(0, 0, 0);
    _velocityLocal = v3(0, 0, 0);
    _rigid: RigidBody = Object.create(null);

    _move = v3(0, 0, 0);
    _force = v3(0, 0, 0);
    _areaForce = v3(0, 0, 0);
    
    _actorBuff: ActorBuff | undefined;
    _actorBag: ActorBag | undefined;
    _actorEquipment: ActorEquipment | undefined;
    _actorSensorDropItem: ActorSensorDropItem | undefined;
    _viewNoWeapon:Node = Object.create(null);
    _forwardNode:Node = Object.create(null);
    _viewRoot:Node | undefined;
    _fps = 0;

    get noAction () {
        return this._data.is_dead || this._data.is_win;
    }

    start () {
        
        this.init('data-player');
        this.node.setScale(v3(1, 1, 1).multiplyScalar(this._data.size));
        this._rigid = this.node.getComponent(RigidBody)!;
        this._rigid.useCCD = true;
        Level.Instance.actor = this;
        this._actorBuff = new ActorBuff(this);
        this._actorBag = new ActorBag(this);
        this._actorEquipment = new ActorEquipment(this);
        this._actorSensorDropItem = this.node.getComponentInChildren(ActorSensorDropItem)!;
        this._forwardNode = UtilNode.find(this.node, 'camera_root');
        this._viewRoot = UtilNode.getChildByName(this.node, 'view_root');

        var load = async ()=> {
            Res.loadPrefab(this._data['res'], (err, asset) => {
                if (asset) {
                    let role_node = UtilNode.find(this.node, 'view_point');
                    this._view = Res.inst(asset, role_node);
                    this._animationGraph = this._view.addComponent(ActorAnimationGraph);
                    const actorSound = this._view.addComponent(ActorSound);
                    actorSound.init(this);
                    this.do('play');
                    //if (!Guide.Instance._has_guide) this.do('play');
                }
            });
        }
        load();
    }

    addAreaForce (force: Vec3) {
        if (this._data.is_glide) {
            u3.c(this._areaForce, force);
            this._rigid.applyForce(this._areaForce);
        }
    }

    onBind () {
        super.onBind();
        this.node.on('addAreaForce', this.addAreaForce, this);
        Msg.bind('guide_end', this.guide_end, this);
    }

    offBind () {
        super.offBind();
        Msg.off('guide_end', this.guide_end);
        this.node.off('addAreaForce', this.addAreaForce, this);
        this._actorBuff?.clear();
        this._actorBuff = undefined;
    }

    public guide_end() {
        this.do('play');
    }

    onUpdate () {
        super.onUpdate();
        this._updates.push(this.run.bind(this));
    }

    offUpdate () {
        super.offUpdate();
        this._rigid.enabled = false;
        this._rigid.setLinearVelocity(new Vec3(0, 0, 0));
    }

    do (name: string) {
        if (this.noAction) return;
        super.do(name);
    }

    run (deltaTime: number) {

        this._data.changed_strength = false;

        this._actorBuff?.update(deltaTime);
        this._fps = game.frameRate as number;
        this._rigid.getLinearVelocity(this._velocity);
        u3.c(this._velocityLocal, Vec3.ZERO);

        // Check run strength
        const canRun = this.calculateRunStrength(deltaTime);
        if (this._move.z > 0) this._velocityLocal.z = this._data.move_speed.y;
        if (this._move.z < 0) this._velocityLocal.z = canRun? -this._data.run_speed.z : -this._data.move_speed.z;
        if (this._move.x !== 0) this._velocityLocal.x = this._data.move_speed.x * this._move.x;

        //rotate y.
        Vec3.rotateY(this._velocityLocal, this._velocityLocal, Vec3.ZERO, this.node.eulerAngles.y * Math.PI / 180);
        this._velocity.x = math.lerp(this._velocity.x, this._velocityLocal.x, deltaTime * 5);
        this._velocity.z = math.lerp(this._velocity.z, this._velocityLocal.z, deltaTime * 5);

        this._actorEquipment?.updateAim(this._velocity.z);
        this._rigid.setLinearVelocity(this._velocity);

        u3.c(this._curDir, this._dir);
        var angle = Vec3.angle(this._curDir, this.node.forward);
        var angleAbs = Math.abs(angle);
        if (angleAbs > 0.01) {
            var side = Math.sign(-this._curDir.clone().cross(this.node.forward).y);
            var angleVel = new Vec3(0, side * angleAbs, 0);
            this._rigid.setAngularVelocity(angleVel);
        }

        this.recoverStrength();
        if (this._data.changed_strength) this.updateStrengthInfo();
    }

    onBuff(key:string) {
        this._actorBuff?.add(key);
    }

    updateGlide (deltaTime: number) {
        this._rigid.getLinearVelocity(this._velocity);
        if (this._data.is_glide && this._velocity.y < 0 && this._areaForce.y <= 0) {
            this._velocity.y = this._data.glide_speed_y;
            this._rigid.setLinearVelocity(this._velocity);
        }

        this._areaForce.y = 0;
    }

    onJump () {

        if (this._data.is_win || this._data.is_dead) return;
        //console.log('is jump:', this._data.is_jump, 'is ground:', this._data.is_ground);
        if (this._data.is_ground) {
            console.log('do jump action');
            this.do('jump');
        }
    }

    onGround () {
        if(!this._data.is_ground) this.do('on_ground');
    }

    offGround () {
        if(this._data.is_ground) this.do('off_ground');
    }

    onWin () {
        this._rigid.clearVelocity();
        this._rigid.clearForces();
    }

    jump () {
        
        console.log(this._data.strength, this._data.cost_jump_strength);
        if (this._data.strength >= this._data.cost_jump_strength) {
            this._data.strength -= this._data.cost_jump_strength;
            this._rigid.applyImpulse(v3(0, this._data.jump_force_y, 0));
            this._data.changed_strength = true;
        }

    }

    onMove (move: Vec3) {
        if (this._data.is_dead) u3.c(this._move, Vec3.ZERO);
        else u3.c(this._move, move);
    }

    onRotation (x: number, y: number) {

        if (this._data.is_dead) return;

        this._angleHead += x;
        this._dir.z = -Math.cos(Math.PI / 180.0 * this._angleHead);
        this._dir.x = Math.sin(Math.PI / 180.0 * this._angleHead);
        this._angleVertical -= y;

        if (this._angleVertical >= this._data.angle_vertical_max) 
            this._angleVertical = this._data.angle_vertical_max;

        if (this._angleVertical <= this._data.angle_vertical_min)
            this._angleVertical = this._data.angle_vertical_min;

    }

    onDir(x: number, z:number) {
        this._dir.z = z;
        this._dir.x = x;
    }
    
    onPause() {
        
    }

    onRun(isRun:boolean) {
        this._data.is_run = isRun;
    }

    onPick() {

        var pickedNode = this._actorSensorDropItem?.getPicked();
        if (pickedNode !== undefined) {
            if (this._actorBag?.pickedItem(pickedNode.name)) {
                console.log('picked item:', pickedNode.name);
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

        this._data.is_crouch = !this._data.is_crouch;

        // set view height.
        // set physic collider height.
        // set hit part height.
        if (this._data.is_crouch === true) {
            this._viewRoot?.setPosition(0, this._data.crouch_height, 0);
        }else{
            this._viewRoot?.setPosition(0, this._data.normal_height, 0);
        }


    }

    onProne() {
        this._data.is_prone = !this._data.is_prone;

        // set view height.
        // set physic collider height.
        // set hit part height.
        if (this._data.is_prone === true) {
            this._viewRoot?.setPosition(0, this._data.prone_height, 0); 
        }else{
            this._viewRoot?.setPosition(0, this._data.normal_height, 0);
        }
    }
    
    onFire() {
        const canUseEquip = this.calculateStrengthUseEquip();
        if (canUseEquip) {
            console.log(' Use equip. --------- ');
            this._actorEquipment?.do('fire');
        }
    }

    onReload() {
        this._actorEquipment?.do('reload');
    }

    onEquip(index:number) {
        if (this._actorEquipment?.equip(index)) {
            this._viewNoWeapon.active = false;
        }else{
            this._viewNoWeapon.active = true;
        }
    }

    calculateStrengthUseEquip():boolean {
        
        const canUseEquip = this._data.strength >= this._data.cost_use_equip_strength;
        if (canUseEquip) {
            this._data.strength -= this._data.cost_use_equip_strength;
            this._data.changed_strength = true;
        }

        return canUseEquip;
    }

    calculateRunStrength(deltaTime:number):boolean {
        const canRun = this._data.is_run && this._data.strength >= this._data.cost_run_strength;
        if (canRun) {
            this._data.strength -= this._data.cost_run_strength * deltaTime;
            this._data.changed_strength = true;
        }
        return canRun;
    }

    recoverStrength () {
        if (this._data.changed_strength) return;
        if (this._data.is_dead) return;
        if (!this._data.is_ground) return;
        if (this._data.is_run) return;
        if (this._data.strength >= this._data.max_strength) return;
        this._data.strength += this._data.recover_ground_strength * game.deltaTime;
        if (this._data.strength >= this._data.max_strength) this._data.strength = this._data.max_strength;
        this._data.changed_strength = true;
    }

    updateStrengthInfo() {
        const percent_value = this._data.strength / this._data.max_strength;
        Msg.emit('fil_strength', percent_value); 
    }

}


        /*

        updateRadar () {
            // Update radar pos.
            Msg.emit('update_pos', this.node.position);
            // Update radar angle.
            Msg.emit('update_angle', this.node.eulerAngles.y + 90);
        }

        if (this._move.z > 0) {
            this._velocity.z = -Math.cos(Math.PI / 180.0 * this._angleHead) * this._data.move_speed.z;
            this._velocity.x = Math.sin(Math.PI / 180.0 * this._angleHead) * this._data.move_speed.z;
        }else if (this._move.z < 0) {

        } else{
            this._velocity.z = 0;
            this._velocity.x = 0;
        }

        this._rigid.setLinearVelocity(this._velocity);

        */

        /* force move.

        this._force.x = 0;
        this._force.z = 0;

        if (this._move.z > 0) this._force.z = this._data.move_force.z * this._move.z;
        if (this._move.z < 0) this._force.z = this._data.move_force.y * this._move.z;

        if (this._move.x !== 0) this._force.x = this._data.move_force.x * this._move.x;

        console.log(this._force);

        this._rigid.applyLocalForce(this._force);

        */

        //this._animationGraph?.play('move_speed',this._velocityLocal.z/this._data.run_speed);

        