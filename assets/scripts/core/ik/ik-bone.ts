import { Quat, Vec3, Node } from "cc";
import MathUtil from "./math-util";
import Point from "./ik-point";
let _tempVec3 = new Vec3;
let _tempVec3_2 = new Vec3;
let _tempQuat = new Quat;
let _tempQuat_2 = new Quat;

export default class Bone extends Point {
    public length: number = 0;
    public sqrMag: number = 0;
    public axis = new Vec3(1, 0, 0);

    constructor (node: Node | null = null, weight:number | null = null) {
    	super();
    	if (node) {
    		this.node = node;
    	}
    	if (weight) {
    		this.weight = weight;
    	}
    }

    public get rotationLimit () {
    	return null;
    }

    public set rotationLimit (value) {
    	return;
    }

    public swing (swingTarget:Vec3, weight:number = 1.0) {
    	if (weight <= 0.0) return;

    	Vec3.subtract(_tempVec3, swingTarget, this.node!.getWorldPosition());
    	Vec3.transformQuat(_tempVec3_2, this.axis, this.node!.getWorldRotation());
    	MathUtil.fromToRotation(_tempQuat, _tempVec3_2, _tempVec3);

    	if (weight >= 1.0) {
    		Quat.multiply(_tempQuat, _tempQuat, this.node!.getWorldRotation());
    		this.node?.setWorldRotation(_tempQuat);
    		return;
    	}
    	MathUtil.quatLerp(_tempQuat, Quat.IDENTITY, _tempQuat, weight);
    	Quat.multiply(_tempQuat, _tempQuat, this.node!.getWorldRotation());
        this.node!.setWorldRotation(_tempQuat);
    }

    public static solverSwing (bones:Bone[], index:number, swingTarget:Vec3, weight:number = 1.0) {
    	if (weight <= 0.0) return;

    	Vec3.subtract(_tempVec3, swingTarget, bones[index].solverPosition);
    	Vec3.transformQuat(_tempVec3_2, bones[index].axis, bones[index].solverRotation);
    	MathUtil.fromToRotation(_tempQuat, _tempVec3_2, _tempVec3);

    	if (weight >= 1.0) {
    		for (let i = index; i < bones.length; i++) {
    			Quat.multiply(bones[i].solverRotation, _tempQuat, bones[index].solverRotation,);
    		}
    		return;
    	}

    	for (let i = index; i < bones.length; i++) {
    		MathUtil.quatLerp(_tempQuat_2, Quat.IDENTITY, _tempQuat, weight);
    		Quat.multiply(bones[i].solverRotation, _tempQuat_2, bones[index].solverRotation);
    	}
    }

    /*
     * Moves the bone to the solver position
     * */
    public setToSolverPosition () {
    	this.node?.setWorldPosition(this.solverPosition);
    }
}