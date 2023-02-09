import { _decorator,  Node, Vec3,  Quat, log } from 'cc';
import { DEBUG } from 'cc/env';
import MathUtil from './math-util';
import IKBone from './ik-bone';
import IKSolverHeuristic from './ik-solver-heuristic';
const { ccclass, property } = _decorator;

let _tempVec3 = new Vec3;
let _tempVec3_2 = new Vec3;
let _tempVec3_3 = new Vec3;
let _tempQuat = new Quat;
let _tempQuat_2 = new Quat;
let _time = 0;

@ccclass('IKSolverAim')
export default class IKSolverAim extends IKSolverHeuristic {
    @property({ type: Node, tooltip: 'The transform that we want to aim at ikPosition.' })
	public aimNode: Node | null = null;

    @property({ type: Node, tooltip: 'The transform that we want to aim at ikPosition.' })
    public rootNode: Node | null = null;

    @property({ tooltip: 'The local axis of the Transform that you want to be aimed at ikPosition.' })
    public axis:Vec3 = new Vec3(0, 0, 1);

    @property({ tooltip: 'Keeps that axis of the Aim Transform directed at the polePosition.' })
    public poleAxis:Vec3 = new Vec3(0, 1, 0);

    @property({ tooltip: 'The position in world space to keep the pole axis of the Aim Transform directed at' })
    public polePosition: Vec3 = new Vec3();

    @property({ tooltip: 'The weight of the Pole.' })
    public poleWeight:number = 0;

    @property({ type: Node, tooltip: 'If assigned, will automatically set polePosition to the position of this Transform.' })
    public poleTarget:Node | null = null;

    @property({ tooltip: 'Clamping rotation of the solver. 0 is free rotation, 1 is completely clamped to transform axis.' })
    public clampWeight:number = 0;

    @property({ tooltip: 'Number of sine smoothing iterations applied to clamping to make it smoother' })
    public clampSmoothing:number = 2;

    protected minBones: number = 1;
    private _step : number = 0;
    private _clampedIKPosition:Vec3 = new Vec3;
    private _lastNode: Node|null = null;
    private _transformPoleAxis: Vec3 = new Vec3;
    private _transformAxis: Vec3 = new Vec3;

    public getAngle ():number {
    	Vec3.subtract(_tempVec3_3, this.ikPosition, this.aimNode!.getWorldPosition());
    	return MathUtil.radiansToDegrees(Vec3.angle(this.transformAxis, _tempVec3_3));
    }

    // Gets the Axis of the AimTransform is world space.
    public get transformAxis (): Vec3 {
    	Vec3.transformQuat(this._transformAxis, this.axis, this.aimNode!.getWorldRotation());
    	return Vec3.clone(this._transformAxis);
    }

    // Gets the Pole Axis of the AimTransform is world space.
    public get transformPoleAxis () :Vec3 {
    	return Vec3.transformQuat(this._transformPoleAxis, this.poleAxis, this.aimNode!.getWorldRotation());
    }

    protected onInitiate () {
    	if ((this.firstInitiation) && this.aimNode != null) {
    		Vec3.add(this.ikPosition, this.aimNode.getWorldPosition(), this.transformAxis.multiplyScalar(3));
    		Vec3.add(this.polePosition, this.aimNode.getWorldPosition(), this.transformPoleAxis.multiplyScalar(3));
    	}

    	this._step = 1.0 / this.bones.length;
    	this.axis.normalize();
    }

    protected onUpdate () {
    	if (this.axis.equals(Vec3.ZERO)) {
    		if (!DEBUG) log("IKSolverAim axis is Vector3.zero.");
    		return;
    	}

    	if (this.poleAxis.equals(Vec3.ZERO) && this.poleWeight > 0) {
    		if (!DEBUG) log("IKSolverAim poleAxis is Vector3.zero.");
    		return;
    	}

    	if (this.target != null) this.target.getWorldPosition(this.ikPosition);
    	if (this.poleTarget != null) this.poleTarget.getWorldPosition(this.polePosition);

    	if (this.XY) this.ikPosition.z = this.bones[0].node!.getWorldPosition().z;

    	// Clamping weights
    	if (this.ikPositionWeight <= 0) {
    		_time = 0;
    		return;
    	}
    	this.ikPositionWeight = MathUtil.clamp(this.ikPositionWeight, 0.0, 1.0);

    	// Rotation Limit on the Aim Transform
    	if (this.aimNode != this._lastNode) {
    		this._lastNode = this.aimNode;
    	}

    	// In case transform becomes unassigned in runtime
    	if (this.aimNode == null) {
    		if (!DEBUG) log("Aim Transform unassigned in Aim IK solver. Please Assign a Transform (lineal descendant to the last bone in the spine) that you want to be aimed at ikPosition");
    		return;
    	}

    	this.clampWeight = MathUtil.clamp(this.clampWeight, 0.0, 1.0);
    	this._clampedIKPosition = this._getClampedIKPosition();

    	Vec3.subtract(_tempVec3, this._clampedIKPosition, this.aimNode.getWorldPosition());
    	Vec3.multiplyScalar(_tempVec3_2, this.transformAxis, _tempVec3.length());

    	MathUtil.sLerp(_tempVec3_2, _tempVec3_2, _tempVec3, this.ikPositionWeight);
    	Vec3.add(this._clampedIKPosition, this.aimNode.getWorldPosition(), _tempVec3_2);

    	// Iterating the solver
    	for (let i = 0; i < this.maxIterations; i++) {
    		// Optimizations
    		if (i >= 1 && this.tolerance > 0 && this.getAngle() < this.tolerance) break;
    		this.lastLocalDirection = Vec3.clone(this.localDirection);
    		this._solve();
    	}

    	this.lastLocalDirection = Vec3.clone(this.localDirection);
    }

    private _solve () {
    	// Rotating bones to get closer to target.
    	for (let i = 0; i < this.bones.length - 1; i++) this._rotateToTarget(this._clampedIKPosition, this.bones[i], this._step * (i + 1) * this.ikPositionWeight * this.bones[i].weight);
    	this._rotateToTarget(this._clampedIKPosition, this.bones[this.bones.length - 1], this.ikPositionWeight * this.bones[this.bones.length - 1].weight);
    }

    private _getClampedIKPosition ():Vec3 {
    	if (this.clampWeight <= 0.0) return Vec3.clone(this.ikPosition);
    	if (this.clampWeight >= 1.0) {
    		Vec3.subtract(_tempVec3, this.ikPosition, this.aimNode!.getWorldPosition());
    		Vec3.multiplyScalar(_tempVec3_2, this.transformAxis, _tempVec3.length());
    		Vec3.add(_tempVec3_3, this.aimNode!.getWorldPosition(), _tempVec3_2);
    		return Vec3.clone(_tempVec3_3);
    	}

    	// Getting the dot product of IK direction and transformAxis
    	Vec3.subtract(_tempVec3, this.ikPosition, this.aimNode!.getWorldPosition());
    	let angle = MathUtil.radiansToDegrees(Vec3.angle(this.transformAxis, _tempVec3));
    	let dot = 1.0 - (angle / 180.0);

    	// Clamping the target
    	let targetClampMlp = this.clampWeight > 0 ? MathUtil.clamp(1.0 - ((this.clampWeight - dot) / (1.0 - dot)), 0.0, 1.0) : 1.0;

    	// Calculating the clamp multiplier
    	let clampMlp = this.clampWeight > 0 ? MathUtil.clamp(dot / this.clampWeight, 0.0, 1.0) : 1.0;

    	for (let i = 0; i < this.clampSmoothing; i++) {
    		let sinF = clampMlp * Math.PI * 0.5;
    		clampMlp = Math.sin(sinF);
    	}

    	// Slerping the IK direction (don't use Lerp here, it breaks it)
    	Vec3.subtract(_tempVec3, this.ikPosition, this.aimNode!.getWorldPosition());
    	Vec3.multiplyScalar(_tempVec3_2, this.transformAxis, 10);

    	// need slerp
    	MathUtil.sLerp(_tempVec3_2, _tempVec3_2, _tempVec3, clampMlp * targetClampMlp);
    	Vec3.add(_tempVec3_3, this.aimNode!.getWorldPosition(), _tempVec3_2);
    	return Vec3.clone(_tempVec3_3);
    }

    /*
     * Rotating bone to get transform aim closer to target
     * */
    private _rotateToTarget (targetPosition:Vec3, bone:IKBone, weight: number) {
    	// Swing
    	if (this.XY) {
    		if (weight >= 0.0) {
    			let dir = this.transformAxis;
    			Vec3.subtract(_tempVec3, targetPosition, this.aimNode!.getWorldPosition());

    			let angleDir = MathUtil.radiansToDegrees(Math.atan2(dir.x, dir.y));
    			let angleTarget = MathUtil.radiansToDegrees(Math.atan2(_tempVec3.x, _tempVec3.y));

    			let deltaAngle = MathUtil.deltaAngle(angleDir, angleTarget);

    			MathUtil.axisAngle(_tempQuat, new Vec3(0, 0, -1), deltaAngle);
    			Quat.multiply(_tempQuat, _tempQuat, bone.node!.getWorldRotation());
    			bone.node?.setRotation(_tempQuat);
    		}
    	} else {
    		if (weight >= 0.0) {
    			Vec3.subtract(_tempVec3, targetPosition, this.aimNode!.getWorldPosition());
    			//  MathUtil.fromToRotation(_tempQuat, this.transformAxis, _tempVec3);
    			Quat.rotationTo(_tempQuat, this.transformAxis.normalize(), _tempVec3.normalize());
    			if (weight >= 1.0) {
    				Quat.multiply(_tempQuat, _tempQuat, bone.node!.getWorldRotation());
                    bone.node!.setWorldRotation(_tempQuat);
    			} else {
    				MathUtil.quatLerp(_tempQuat, Quat.IDENTITY, _tempQuat, weight);
    				Quat.multiply(_tempQuat, _tempQuat, bone.node!.getWorldRotation());
					Quat.normalize(_tempQuat, _tempQuat);
                   	bone.node!.setWorldRotation(_tempQuat);
    			}
    		}

    		// Pole
    		if (this.poleWeight > 0.0) {
    			// wait to do
    			// Vec3.subtract(_tempVec3, this.polePosition , this.aimNode!.getWorldPosition())
    			// // Ortho-normalize to transform axis to make this a twisting only operation
    			// Vec3.copy(_tempVec3_2, _tempVec3);
    			// let normal = this.transformAxis;
    			// Vector3.OrthoNormalize(ref normal, ref poleDirOrtho);
    			// Quaternion toPole = Quaternion.FromToRotation(this.transformPoleAxis, poleDirOrtho);
    			// bone.node.rotation = Quaternion.Lerp(Quaternion.identity, toPole, weight * this.poleWeight) * bone.node.rotation;
    		}
    	}

    }

}