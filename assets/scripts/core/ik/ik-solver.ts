import { _decorator, Component, Node, Vec3, RigidBody, physics, v3, Quat, director, quat, CCBoolean } from 'cc';
import Bone from './ik-bone';
const { ccclass, property } = _decorator;

@ccclass('IKSolver')
export default class IKSolver {
    // @property({type:CCBoolean,tooltip: 'If true, will fix all the Transforms used by the solver to their initial state in each Update. This prevents potential problems with unanimated bones and animator culling with a small cost of performance. Not recommended for CCD and FABRIK solvers.'})
    public isFixTransforms: boolean = true;

    public initiated: boolean = false;
    protected root: Node | null = null;
    protected firstInitiation: boolean = true;
    public ikPosition: Vec3 = new Vec3();
    public ikPositionWeight: number = 1.0;


    protected onInitiate () {}
    protected storeDefaultLocalState () {}
    protected onUpdate () {}
    protected fixTransforms () {}

    constructor (root:Node) {
    	this.root = root;
    }

    public initiate (root:Node | null) {
    	this.root = root;
    	this.initiated = false;

    	this.onInitiate();
    	this.storeDefaultLocalState();
    	this.initiated = true;
    	this.firstInitiation = false;
    }

    public lateUpdate () {
    	if (this.firstInitiation) this.initiate(this.root); // when the IK component has been disabled in Awake, this will initiate it.
    	if (!this.initiated) return;

    	this.onUpdate();
    }

    public static containsDuplicateBone (bones:Bone[]) {
    	for (let i = 0; i < bones.length; i++) {
    		for (let i2 = 0; i2 < bones.length; i2++) {
    			if (i != i2 && bones[i].node == bones[i2].node) return bones[i].node;
    		}
    	}
    	return null;
    }

    public update () {
    	this.isFixTransforms && this.fixTransforms();
    }
}