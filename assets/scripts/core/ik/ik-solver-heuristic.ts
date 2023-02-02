import { _decorator,  Node, Vec3,  Quat,  CCFloat } from 'cc';
import MathUtil from './math-util';
import IKBone from './ik-bone';
import IKPoint from "./ik-point";
import IKSolver from './ik-solver';
const { ccclass, property } = _decorator;

let _tempVec3 = new Vec3;
let _tempVec3_2 = new Vec3;
let _tempQuat = new Quat;
let _tempQuat_2 = new Quat;

@ccclass('IKSolverHeuristic')
export default class IKSolverHeuristic extends IKSolver {
    @property({ type: Node, tooltip: 'Reference to the AimIK component.' })
	public target: Node | null = null;

    @property({ tooltip: 'Minimum distance from last reached position. Will stop solving if difference from previous reached position is less than tolerance. If tolerance is zero, will iterate until maxIterations.' })
    public tolerance: number = 0;

    @property({ tooltip: 'Max iterations per frame.' })
    public maxIterations:number = 4;

    @property({ tooltip: 'Solve in 2D?' })
    public XY :boolean = false;


    // @property({type:[Node], tooltip: 'boneNodes'})
    // public boneNodes :Node[] = [];

    // @property({type:[CCFloat],tooltip: 'boneWeights'})
    // public boneWeights: number [] = [];


    // @property({type:[IKBone], tooltip: 'The hierarchy of bones.'})
    public bones: IKBone [] = [];

    protected lastLocalDirection: Vec3 | null = null;
    protected chainLength: number = 0;
    private _localDirection: Vec3 = new Vec3;

    // initBones (){
    //     this.boneNodes.forEach((node, index)=>{
    //         this.bones.push(new IKBone(node, this.boneWeights[index]));
    //     })
    // }

    public setChain (hierarchy:Node[], root:Node)
    {
        if (this.bones == null || this.bones.length != hierarchy.length) this.bones = new Array<IKBone>(hierarchy.length);
        for (let i = 0; i < hierarchy.length; i++)
        {
            if (this.bones[i] == null) this.bones[i] = new IKBone();
            this.bones[i].node = hierarchy[i];
        }

        this.initiate(root);
        return this.initiated;
    }

    public addBone (bone:Node)
    {
        let newBones:Node[] = new Array<Node>(this.bones.length + 1);

        for (let i = 0; i < this.bones.length; i++)
        {
            newBones[i] = this.bones[i].node!;
        }

        newBones[newBones.length - 1] = bone;

        this.setChain(newBones, this.root!);
    }

    public storeDefaultLocalState ()
    {
        for (let i = 0; i < this.bones.length; i++) this.bones[i].storeDefaultLocalState();
    }

    public fixTransforms ()
    {
        if (!this.initiated) return;
        if (this.ikPositionWeight <= 0.0) return;

        for (let i = 0; i < this.bones.length; i++) this.bones[i].fixTransform();
    }

    public getPoints ()
    {
        return this.bones;
    }

    public getPoint (node:Node) : IKPoint | null
    {
        for (let i = 0; i < this.bones.length; i++) if (this.bones[i].node == node) return this.bones[i] as IKPoint;
        return null;
    }

    protected initiateBones ()
    {
        this.chainLength = 0;

        for (let i = 0; i < this.bones.length; i++)
        {
            // Find out which local axis is directed at child/target position
            if (i < this.bones.length - 1)
            {
                Vec3.subtract(_tempVec3, this.bones[i].node!.getWorldPosition(), this.bones[i + 1].node!.getWorldPosition());
                this.bones[i].length = _tempVec3.length();
                this.chainLength += this.bones[i].length;

                this.bones[i + 1].node!.getWorldPosition(_tempVec3_2);
                Vec3.subtract(_tempVec3_2, _tempVec3_2, this.bones[i].node!.getWorldPosition());
                Quat.invert(_tempQuat, this.bones[i].node!.getWorldRotation());
                Vec3.transformQuat(this.bones[i].axis, _tempVec3_2, _tempQuat);
            }
            else
            {
                Vec3.subtract(_tempVec3, this.bones[this.bones.length - 1].node!.getWorldPosition(), this.bones[0].node!.getWorldPosition());
                Quat.invert(_tempQuat, this.bones[i].node!.getWorldRotation());
                Vec3.transformQuat(this.bones[i].axis, _tempVec3_2, _tempQuat);
            }
        }
    }

    protected get localDirection () :Vec3 {
        MathUtil.directionToNodeSpace(this._localDirection, this.bones[this.bones.length - 1].node!.getWorldPosition().subtract(this.bones[0].node!.getWorldPosition()), this.bones[0].node!);
        return this._localDirection.clone();
    }

    protected get positionOffset () : number {
        return Vec3.lengthSqr(this.localDirection.subtract(this.lastLocalDirection!));
    }

    protected getSingularityOffset ()
    {
        if (!this._singularityDetected()) return Vec3.ZERO;

        Vec3.subtract(_tempVec3, this.ikPosition, this.bones[0].node!.getWorldPosition());
        _tempVec3.normalize();

        let secondaryDirection:Vec3 = new Vec3(_tempVec3.y, _tempVec3.z, _tempVec3.x);
        Vec3.cross(_tempVec3, _tempVec3, secondaryDirection);

        return _tempVec3.multiplyScalar(this.bones[this.bones.length - 2].length * 0.5).clone();
    }

    private _singularityDetected ()
    {
        if (!this.initiated) return false;

        Vec3.subtract(_tempVec3, this.bones[this.bones.length - 1].node!.getWorldPosition(), this.bones[0].node!.getWorldPosition());
        Vec3.subtract(_tempVec3_2, this.ikPosition, this.bones[0].node!.getWorldPosition());

        let toLastBoneDistance =  _tempVec3.length();
        let toIKPositionDistance =  _tempVec3_2.length();

        if (toLastBoneDistance < toIKPositionDistance) return false;
        if (toLastBoneDistance < this.chainLength - (this.bones[this.bones.length - 2].length * 0.1)) return false;
    }

}