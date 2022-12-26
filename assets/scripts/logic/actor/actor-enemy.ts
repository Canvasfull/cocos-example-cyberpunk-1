import { _decorator, RigidBody, Vec3, Vec2, v3, game, Quat, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { IActorInput } from '../../core/input/IActorInput';
import { Res } from '../../core/res/res';
import { u3, UtilNode } from '../../core/util/util';
import { Level } from '../level/level';
import { ActorAnimationGraph } from './actor-animation-graph';
import { ActorBuff } from './actor-buff';
import { ActorEquipment } from './actor-equipment';
import { ActorEquipBase } from './actor-equip-base';
const { ccclass, property } = _decorator;

@ccclass('ActorEnemy')
export class ActorEnemy extends ActorBase implements IActorInput {

    onPick() {
        //throw new Error('Method not implemented.');
    }
    onDrop() {
        //throw new Error('Method not implemented.');
    }

    _velocity = v3(0, 0, 0);
    _velocity_local = v3(0, 0, 0);
    _velocity_quat = new Quat();

    _rigid: RigidBody | undefined;
    _screenPos = new Vec2(0, 0);

    _move = v3(0, 0, 0);
    _force = v3(0, 0, 0);
    _area_force = v3(0, 0, 0);

    _strength: number = 0;
    _real_speed: number = 1;
    _cur_speed: number = 1;
    _smooth_speed: number = 3;
    _move_rate = 0;
    _size_scale = 1;

    _actorBuff: ActorBuff | undefined;
    _actorEquipment: ActorEquipment | undefined;

    _actorEquip:ActorEquipBase | undefined;

    _viewNoWeapon:Node = Object.create(null);
    _forwardNode:Node = Object.create(null);
    _fps = 0;

    get noAction () {
        return this._data.is_dead || this._data.is_win;
    }

    start () {
        
        this.init(`data-${this.node.name}`);
        this.node.setScale(v3(1, 1, 1).multiplyScalar(this._data.size));
        this._rigid = this.node.getComponent(RigidBody)!;
        this._rigid.useCCD = true;
        Level.Instance.actor = this;
        this._actorBuff = new ActorBuff(this);
        this._forwardNode = UtilNode.find(this.node, 'view_point');

        var load = async ()=> {
            Res.loadPrefab(this._data['res'], (err, asset) => {
                if (asset) {
                    let role_node = UtilNode.find(this.node, 'view_point');
                    console.log(role_node);
                    this._view = Res.inst(asset, role_node);
                    this._animationGraph = this._view.addComponent(ActorAnimationGraph);
                }
            });
        }
        
        load();
        this.do('play');

    }

    addAreaForce (force: Vec3) {
        if (this._data.is_glide) {
            u3.c(this._area_force, force);
            this._rigid!.applyForce(this._area_force);
        }
    }

    onBind () {
        super.onBind();
    }

    offBind () {
        super.offBind();
        this._actorBuff?.clear();
        this._actorBuff = undefined;
    }

    public updateAttribute () {

        super.updateAttribute();
        //update size.
        var size = this._data.size * this._data.size_percent;
        if (this._data.size > this._data.max_size) size = this._data.max_size;
        if (this._data.size < this._data.min_size) size = this._data.min_size;
        this.node.setScale(v3(1, 1, 1).multiplyScalar(size));
        if (this._data.size_percent !== 1) this._size_scale = this._data.size_percent * 0.6;
    }

    onUpdate () {
        super.onUpdate();
        this._updates.push(this.run.bind(this));
    }

    offUpdate () {
        super.offUpdate();
        this._rigid!.enabled = false;
        this._rigid!.setLinearVelocity(new Vec3(0, 0, 0));
    }

    do (name: string) {
        if (this.noAction) return;
        super.do(name);
    }

    run (deltaTime: number) {

        this._actorBuff?.update(deltaTime);
        this._fps = game.frameRate as number;

        this._rigid!.getLinearVelocity(this._velocity);
        u3.c(this._velocity_local, Vec3.ZERO);

        // Check run strength
        const canRun = this.calculateRunStrength(deltaTime); 

        if (this._move.z > 0) this._velocity_local.z = this._data.move_speed.y;
        if (this._move.z < 0) this._velocity_local.z = canRun? -this._data.run_speed.z : -this._data.move_speed.z;
        if (this._move.x !== 0) this._velocity_local.x = this._data.move_speed.x * this._move.x;

        this._animationGraph.play('move_speed', this._velocity_local.z);

        //rotate y.
        Vec3.rotateY(this._velocity_local, this._velocity_local, Vec3.ZERO, this.node.eulerAngles.y * Math.PI / 180);

        this._velocity.x = this._velocity_local.x;
        this._velocity.z = this._velocity_local.z;

        this._rigid!.setLinearVelocity(this._velocity);
        u3.c(this._curDir, this._dir);
        var angle = Vec3.angle(this._curDir, this.node.forward);
        var angleAbs = Math.abs(angle) * 5;
        if (angleAbs > 0.01) {
            var side = Math.sign(-this._curDir.clone().cross(this.node.forward).y);
            var angleVel = new Vec3(0, side * angleAbs * 5, 0);
            this._rigid!.setAngularVelocity(angleVel);
        }

        if (this._data.is_ground) {
            this.recoverStrength();
        }

    }

    onBuff(key:string) {
        this._actorBuff?.add(key);
    }

    updateGlide (deltaTime: number) {
        this._rigid!.getLinearVelocity(this._velocity);
        if (this._data.is_glide && this._velocity.y < 0 && this._area_force.y <= 0) {
            this._velocity.y = this._data.glide_speed_y;
            this._rigid!.setLinearVelocity(this._velocity);
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
        this._rigid!.clearVelocity();
        this._rigid!.clearForces();
    }

    jump () {

        if (this._data.strength >= this._data.cost_jump_strength) {
            this._data.strength -= this._data.cost_jump_strength;
            this._rigid!.applyImpulse(v3(0, this._data.jump_force_y * this._size_scale, 0));
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

    onDir(x:number, z:number) {
        if (this._data.is_dead) return;
        this._dir.z = z;
        this._dir.x = x;
    }
    
    onPause() {
        
    }

    onRun(isRun:boolean) {
        this._data.is_run = isRun;
    }

    onCrouch() {

    }

    onProne() {

    }
    
    onFire() {
        const canUseEquip = this.calculateStrengthUseEquip();
        if (canUseEquip) {
            console.log(' Use equip. --------- ');
            this._actorEquipment!.do('fire');
        }
    }

    onReload() {
        this._actorEquipment!.do('reload');
    }

    onEquip(index:number) {
        if (this._actorEquipment!.equip(index)) {
            this._viewNoWeapon.active = false;
        }else{
            this._viewNoWeapon.active = true;
        }
    }

    calculateStrengthUseEquip():boolean {
        const canUseEquip = this._data.strength >= this._data.cost_use_equip_strength;

        if (canUseEquip) {
            this._data.strength -= this._data.cost_use_equip_strength;
        }

        return canUseEquip;
    }

    calculateRunStrength(deltaTime:number):boolean {
        const canRun = this._data.is_run && this._data.strength >= this._data.cost_run_strength;

        if (canRun) {
            this._data.strength -= this._data.cost_run_strength * deltaTime;
        }

        return canRun;
    }

    recoverStrength () {

        if (this._data.is_jump || this._data.is_run) return;
        if (this._data.strength >= this._data.max_strength) return;
        this._data.strength += this._data.recover_ground_strength;
        if (this._data.strength >= this._data.max_strength) this._data.strength = this._data.max_strength;
    }
}

