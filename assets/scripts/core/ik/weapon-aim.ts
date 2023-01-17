import { _decorator, Node, Component, ccenum, Quat, error, Vec3, view } from 'cc';
import MathUtil from './math-util';
//import  { Weapon } from './weapon';
//import { CharacterTypes } from '../core/character';
//import MathUtil from '../util/math-util';
//import CinemachineCameraManager from '../cinemachine/cinemachine-camera-manager';
//import { ColliderGroup, ControlType } from '../scene/define';
//import { GameManager } from '../manager/game-manager';
const { ccclass, property, type } = _decorator;

// / the list of possible control modes
export enum AimControls {
	Auto,
	Center,
	Mouse
}
ccenum(AimControls);

export enum AimRotateType {
	ByNone,
	ByCharacter,
	ByWeapon
}
ccenum(AimRotateType);

let _tempQuat: Quat = new Quat;
let _tempVec3: Vec3 = new Vec3;
@ccclass('WeaponAim')
export class WeaponAim extends Component {
	@type(AimRotateType)
	yawRotateType: AimRotateType = AimRotateType.ByCharacter;

	@type(AimRotateType)
	pitchRotateType: AimRotateType = AimRotateType.ByCharacter;

    //public mask: number = ColliderGroup.All;
	public aimControl: AimControls = AimControls.Mouse;

	@property
	isAutoAim = false;

	@property
	public pitchWhenYawInRange = 10;

	@property
	public maxPitch = 80;

	@property
	public minPitch = -80;

	@property
	public aimReadyValue = 2;

	@property
	aimRange: number = 0.2;

	// / the weapon's current direction
	public get currentAim () { return this._currentAim }
	// / the current angle the weapon is aiming at
	public currentYaw = 0;
	public currentPitch = 0;

    //protected _weapon: Weapon | null = null;
    protected _currentAim: Vec3 = new Vec3;
	protected _lookRotation: Quat = new Quat;

	public aimWasReady = false;

	protected _currentTarget: Node | null = null;
	public set currentTarget (value: Node | null) {
	    if (value == this._currentTarget) {
	        return;
	    }
	    this.aimWasReady = false;
	    this._currentTarget = value;
	}

	start () {
	    this.initialization();
	}

	initialization () {
	    //this._weapon = this.getComponent(Weapon);
	}

	// Computes the current aim direction
	updateCurrentAim () {
		
		/*
	    if (!this._weapon || !this._weapon.owner || this._weapon.reloading) return;
	    let owner = this._weapon.owner;
	    if (owner.characterType == CharacterTypes.Player && !owner.linkedInputManager) {
	        return;
	    }

	    let controlType = owner.controlType;
	    this.mask = controlType == ControlType.TopDown ? ColliderGroup.TopDownAim : ColliderGroup.ThirdPersonAim;
		*/

	    switch (this.aimControl) {
	        case AimControls.Center:
	            this.updateCenterAim();
	            break;
	        case AimControls.Mouse:
	            this.updateMouseAim();
	            break;
	        case AimControls.Auto:
	            this.updateAutoAim();
	            break;
	    }
	}

	updateAutoAim () {
	    if (this._currentTarget) {
			this._currentTarget!.getWorldPosition(this._currentAim);

			// debug auto target
			// gameMgr.drawNode(this._currentTarget!);
			this.calculateCurrentAim();
	    } else {
	        this.currentPitch = 0;
	        this.aimWasReady = false;
	    }
	}

	updateCenterAim () {
	    let viewport = view.getViewportRect();
	    let x = viewport.width / 2;
	    let y = viewport.height / 2;

	    // get the position behind the weapon
		/*
	    let success = CinemachineCameraManager.instance.getScreenPointToWorldPositionWithNodeDistance(this._currentAim, x, y, this.mask, this._weapon?.getRotatingModel() || this.node);
	    if (!success) {
	        this.currentPitch = 0;
	        return;
	    }
		*/
	    this.calculateCurrentAim();
	}

	updateMouseAim () {

		/*
	    if (!this._weapon || !this._weapon.owner || !this._weapon.owner.linkedInputManager) {
	        this.currentPitch = 0;
	        return;
	    }

	    let mousePosition = this._weapon.owner.linkedInputManager.secondaryLocation;
	    let success = CinemachineCameraManager.instance.getScreenPointToWorldPosition(this._currentAim, mousePosition.x, mousePosition.y, this.mask);
	    if (!success) {
	        this.currentPitch = 0;
	        return;
	    }
		*/

	    this.calculateCurrentAim();
	}

	calculateCurrentAim () {
	    let refNode = this.node;//this._weapon?.getRotatingModel() || this.node;
	    // debug aim line
	    // GameManager.instance.drawLineByPos(this._currentAim, refNode.getWorldPosition());

		 MathUtil.convertToNodeSpace(_tempVec3, this._currentAim, refNode);
	    if (_tempVec3.length() < this.aimRange) {
        	return;
	    }

	    _tempVec3.normalize();
	    // vector rotate begin from z axis to x axis angle
	    /*
		       z
		      / \
		       |
        x /____|_____
          \    |
               |
		*/
	    let addYaw = MathUtil.radiansToDegrees(Math.atan2(_tempVec3.x, _tempVec3.z));
	    let addPitch = -MathUtil.radiansToDegrees(Math.atan2(_tempVec3.y, _tempVec3.z));
	    if (Math.abs(addYaw) > this.pitchWhenYawInRange) addPitch = 0;

	    this.currentYaw = MathUtil.clampDegrees(this.currentYaw + addYaw);
	    //if (this._weapon!.owner!.controlType == ControlType.TopDown) {
	    //    this.currentPitch = 0;
	    //} else {
	        this.currentPitch = MathUtil.clamp(MathUtil.clampDegrees(this.currentPitch + addPitch), this.minPitch, this.maxPitch);
	    //}

	    let aimReady = this.aimReady(addYaw, addPitch);
	    if (aimReady) {
	        this.aimWasReady = true;
	    }
	}

	aimReady (addYaw:number, addPitch:number) {
	   return Math.abs(addYaw) < this.aimReadyValue && Math.abs(addPitch) < this.aimReadyValue;
	}

	earlyProcess (dt:number) {
	}

	process (dt:number) {
	    this.updateCurrentAim();
	    this.determineWeaponRotation();
	}

	lateProcess (dt: number) {
	}

	determineWeaponRotation () {
	    if (this.yawRotateType != AimRotateType.ByWeapon && this.pitchRotateType != AimRotateType.ByWeapon) {
	        return;
	    }

	    let yaw = 0; let
	        pitch = 0;
	    if (this.yawRotateType == AimRotateType.ByWeapon) {
	        yaw = this.currentYaw;
	    }

	    if (this.pitchRotateType == AimRotateType.ByWeapon) {
	        pitch = this.currentPitch;
	    }

	    let node = this.node; //this._weapon?.getRotatingModel() || this.node;
	    node.getRotation(_tempQuat);
	    Quat.fromEuler(this._lookRotation, pitch, yaw, 0);
	    Quat.multiply(this._lookRotation, _tempQuat, this._lookRotation);
		/*
	    if (this._weapon) {
	        this._weapon.rotateWeapon(this._lookRotation);
	    }
		*/
	}
}