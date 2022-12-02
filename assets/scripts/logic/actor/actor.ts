
import { _decorator, RigidBody, Vec3, Vec2, v3, game, Quat, Node, math } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { IActorInput } from '../../core/input/IActorInput';
import { Local } from '../../core/local/local';
import { Msg } from '../../core/msg/msg';
import { Res } from '../../core/res/res';
import { u3, UtilNode } from '../../core/util/util';
import { Level } from '../level/level';
import { ActorAnimationGraph } from './actor-animation-graph';
import { ActorBag } from './actor-bag';
import { ActorBuff } from './actor-buff';
import { ActorEquipment } from './actor-equipment';
import { actor_push_box } from './actor-push-box';
import { ActorSensorDropItem } from './actor-sensor-drop-item';
const { ccclass } = _decorator;

@ccclass('Actor')
export class Actor extends ActorBase implements IActorInput {

    _velocity = v3(0, 0, 0);
    _velocity_local = v3(0, 0, 0);
    //_velocity_quat = new Quat();
    _rigid: RigidBody = Object.create(null);

    _move = v3(0, 0, 0);
    _force = v3(0, 0, 0);
    _area_force = v3(0, 0, 0);
    
    _actorBuff: ActorBuff;
    _actroBag: ActorBag;
    _actorEquipment: ActorEquipment;
    _actorSensorDropItem: ActorSensorDropItem;
    _actorPushBox: actor_push_box;
    _viewNoWeapon:Node = Object.create(null);
    _forwardNode:Node = Object.create(null);
    _fps = 0;

    //#region  logic
    get noAction () {
        return this._data.is_dead || this._data.is_win;
    }
    //#endregion

    start () {
        
        this.init('data-player');
        this.node.setScale(v3(1, 1, 1).multiplyScalar(this._data.size));
        this._rigid = this.node.getComponent(RigidBody);
        this._rigid.useCCD = true;
        Level.Instance.actor = this;
        this._actorBuff = new ActorBuff(this);
        this._actroBag = new ActorBag(this);
        this._actorEquipment = new ActorEquipment(this);
        this._actorSensorDropItem = this.node.getComponentInChildren(ActorSensorDropItem);

        this._forwardNode = UtilNode.find(this.node, 'camera_root');

        var load = async ()=> {
            Res.loadPrefab(this._data['res'], (err, asset) => {
                if (asset) {
                    let role_node = UtilNode.find(this.node, 'view_point');
                    this._view = Res.inst(asset, role_node);
                    this._animg = this._view.addComponent(ActorAnimationGraph);
                    //var actorsound = this._view.addComponent(ActorSound);
                    //actorsound.init(this);
                    //this._actorPushBox = this.addComponent(actor_push_box);
                    //if(!Guide.Instance._has_guide) this.do('play');
                    //this._view.addComponent(ActorLookat); 
                }
            });
        }
        
        load();
        this.do('play');
    }

    addAreaForce (force: Vec3) {
        if (this._data.is_glide) {
            u3.c(this._area_force, force);
            this._rigid.applyForce(this._area_force);
        }
    }

    onBind () {
        super.onBind();
        this.node.on('addAreaForce', this.addAreaForce, this);
        Msg.onbind('guide_end', this.guide_end, this);
    }

    offBind () {
        super.offBind();
        Msg.off('guide_end', this.guide_end);
        this.node.off('addAreaForce', this.addAreaForce, this);
        this._actorBuff.clear();
        this._actorBuff = null;
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

    run (detalTime: number) {

        this._data.changed_strength = false;

        this._actorBuff.update(detalTime);
        this._fps = game.frameRate as number;

        this._rigid.getLinearVelocity(this._velocity);

        u3.c(this._velocity_local, Vec3.ZERO);

        // Check run strength
        const canRun = this.calculateRunStrength(detalTime);
        if(this._move.z > 0) this._velocity_local.z = this._data.move_speed.y;
        if(this._move.z < 0) this._velocity_local.z = canRun? -this._data.run_speed.z : -this._data.move_speed.z;
        if(this._move.x != 0) this._velocity_local.x = this._data.move_speed.x * this._move.x;

        //rotate y.
        Vec3.rotateY(this._velocity_local, this._velocity_local, Vec3.ZERO, this.node.eulerAngles.y * Math.PI / 180);
        this._velocity.x = math.lerp(this._velocity.x, this._velocity_local.x, detalTime * 5);
        this._velocity.z = math.lerp(this._velocity.z, this._velocity_local.z, detalTime * 5);

        this._actorEquipment.updateAim(this._velocity.z);
        this._rigid.setLinearVelocity(this._velocity);

        u3.c(this._curdir, this._dir);
        var angle = Vec3.angle(this._curdir, this.node.forward);
        var angleAbs = Math.abs(angle);
        if (angleAbs > 0.01) {
            var side = Math.sign(-this._curdir.clone().cross(this.node.forward).y);
            var angleVel = new Vec3(0, side * angleAbs, 0);
            this._rigid.setAngularVelocity(angleVel);
        }

        this.recoverStrength();
        if(this._data.changed_strength) this.updateStrengthInfo();
    }

    onBuff(key:string) {
        //console.log('add buff:', key)
        this._actorBuff.add(key);
    }

    onEnterBox() {
        if(this._actorPushBox.checkPushBox()) {
            this._data.is_sokoban = true;
        }
    }

    onExitBox() {
        if(this._data.is_sokoban) {
            this._data.is_sokoban = false;
            this._animg.play('is_sokoban', false);
        }
    }

    updateGlide (detalTime: number) {
        this._rigid.getLinearVelocity(this._velocity);
        if (this._data.is_glide && this._velocity.y < 0 && this._area_force.y <= 0) {
            this._velocity.y = this._data.glide_speed_y;
            this._rigid.setLinearVelocity(this._velocity);
        }

        this._area_force.y = 0;
    }

    onJump () {

        if (this._data.is_win || this._data.is_dead) return;

        if (this._data.is_ground && !this._data.is_jump) {
            this.do('jump');
        }
    }

    onGround () {
        this.do('on_ground');
    }

    offGround () {
        this.do('off_ground');
    }

    onWin () {
        this._rigid.clearVelocity();
        this._rigid.clearForces();
    }

    jump () {

        if(this._data.strength >= this._data.cost_jump_strength) {
            this._data.strength -= this._data.cost_jump_strength;
            this._rigid.applyImpulse(v3(0, this._data.jump_force_y, 0));
            this._data.changed_strength = true;
        }

    }

    onMove (move: Vec3) {
        if(this._data.is_dead) u3.c(this._move, Vec3.ZERO);
        else u3.c(this._move, move);
    }

    onRotation (x: number, y: number) {

        if(this._data.is_dead) return;

        this._angle_head += x;
        this._dir.z = -Math.cos(Math.PI / 180.0 * this._angle_head);
        this._dir.x = Math.sin(Math.PI / 180.0 * this._angle_head);

        this._angle_vertical -= y;

        if (this._angle_vertical >= this._data.angle_vertical_max) 
            this._angle_vertical = this._data.angle_vertical_max;

        if (this._angle_vertical <= this._data.angle_vertical_min)
            this._angle_vertical = this._data.angle_vertical_min;

    }

    onDir(x: number, z:number) {
        this._dir.z = z;
        this._dir.x = x;
    }
    
    onPasue() {
        
    }

    onRun(isrun:boolean) {
        this._data.is_run = isrun;
    }

    onPick() {

        var pickedNode = this._actorSensorDropItem.getPicked();
        if(pickedNode != null) {
            if(this._actroBag.pickedItem(pickedNode.name)) {
                console.log('picked item:', pickedNode.name);
                pickedNode.emit('picked');
                Msg.emit(
                    'msg_tips', 
                    `${Local.Instance.get('picked')}  ${pickedNode.name}  x 1`
                );
                Msg.emit('msg_update_bag');
            }else{
                console.log('My bag is full');
                Msg.emit(
                    'msg_tips', 
                    `${Local.Instance.get('Bag is full.')}`
                );
            }
        }

    }

    onDrop() {
        if(this._actroBag.dropItem()) {
            Msg.emit('msg_update_bag');
        }
    }

    onCrouch() {

    }

    onProne() {

    }
    
    onFire() {
        const canUseEquip = this.caculateStrengthUseEquip();
        if(canUseEquip) {
            console.log(' Use equip. --------- ');
            this._actorEquipment.do('fire');
        }
    }

    onReload() {
        this._actorEquipment?.do('reload');
    }

    onEquip(index:number) {
        if(this._actorEquipment.equip(index)) {
            this._viewNoWeapon.active = false;
        }else{
            this._viewNoWeapon.active = true;
        }
    }

    caculateStrengthUseEquip():boolean {
        
        const canUseEquip = this._data.strength >= this._data.cost_use_equip_strength;
        if(canUseEquip) {
            this._data.strength -= this._data.cost_use_equip_strength;
            this._data.changed_strength = true;
        }

        return canUseEquip;
    }

    calculateRunStrength(deltaTime:number):boolean {
        const canRun = this._data.is_run && this._data.strength >= this._data.cost_run_strength;
        if(canRun) {
            this._data.strength -= this._data.cost_run_strength * deltaTime;
            this._data.changed_strength = true;
        }
        return canRun;
    }

    recoverStrength () {
        if(this._data.changed_strength) return;
        if(this._data.is_dead) return;
        if(!this._data.is_ground) return;
        if(this._data.isrun) return;
        if(this._data.strength >= this._data.max_strength) return;
        this._data.strength += this._data.recover_ground_strength * game.deltaTime;
        if(this._data.strength >= this._data.max_strength) this._data.strength = this._data.max_strength;
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

        if(this._move.z > 0) {
            this._velocity.z = -Math.cos(Math.PI / 180.0 * this._angle_head) * this._data.move_speed.z;
            this._velocity.x = Math.sin(Math.PI / 180.0 * this._angle_head) * this._data.move_speed.z;
        }else if(this._move.z < 0) {

        } else{
            this._velocity.z = 0;
            this._velocity.x = 0;
        }

        this._rigid.setLinearVelocity(this._velocity);

        */

        /* force move.

        this._force.x = 0;
        this._force.z = 0;

        if(this._move.z > 0) this._force.z = this._data.move_force.z * this._move.z;
        if(this._move.z < 0) this._force.z = this._data.move_force.y * this._move.z;

        if(this._move.x != 0) this._force.x = this._data.move_force.x * this._move.x;

        console.log(this._force);

        this._rigid.applyLocalForce(this._force);

        */

        //this._animg?.play('move_speed',this._velocity_local.z/this._data.run_speed);

        