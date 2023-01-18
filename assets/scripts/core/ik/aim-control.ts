import { _decorator, Component, Node, Vec3,  Quat, director, math } from 'cc';
import MathUtil from './math-util';
import AimIK from './aim-ik';
import IKSolverAim from './ik-solver-aim';
import { UtilVec3 } from '../util/util';
const { ccclass, property } = _decorator;

let _tempVec3 = new Vec3;
let _tempVec3_2 = new Vec3;
let _tempQuat = new Quat;
let _tempQuat_2 = new Quat;
let tempPivot = new Vec3;

@ccclass('AimControl')
export default class AimControl extends Component {
    @property({ type: AimIK, tooltip: 'Reference to the AimIK component.' })
    public ik: AimIK | null = null;

    @property({ tooltip: 'Master weight of the IK solver.' })
    public weight: number = 1.0;

    @property({ type: Node, tooltip: 'The target to aim at. Do not use the Target transform that is assigned to AimIK. Set to null if you wish to stop aiming.' })
    public target: Node | null = null;

    @property({ tooltip: 'The time it takes to switch targets.' })
    public targetSwitchSmoothTime:number = 0.3;

    @property({ tooltip: 'The time it takes to blend in/out of AimIK weight.' })
    public weightSmoothTime : number = 0.3;

    @property({ tooltip: 'Enables smooth turning towards the target according to the parameters under this header.' })
    public smoothTurnTowardsTarget : boolean = true;

    @property({ tooltip: 'Speed of turning towards the target using Vector3.RotateTowards.' })
    public maxRadiansDelta : number = 3;

    @property({ tooltip: 'Speed of moving towards the target using Vector3.RotateTowards.' })
    public maxMagnitudeDelta : number = 3;

    @property({ tooltip: 'Speed of slerping towards the target.' })
    public slerpSpeed : number = 3.0;

    @property({ type: Vec3, tooltip: 'The position of the pivot that the aim target is rotated around relative to the root of the character.' })
    public pivotOffsetFromRoot : Vec3 = new Vec3(0, 0, 0);

    @property({ tooltip: 'Minimum distance of aiming from the first bone. Keeps the solver from failing if the target is too close.' })
    public minDistance : number = 1.0;

    @property({ type: Vec3, tooltip: 'Offset applied to the target in world space. Convenient for scripting aiming inaccuracy.' })
    public offset : Vec3 = new Vec3(0, 0, 0);

    @property({ tooltip: 'Character root will be rotate around the Y axis to keep root forward within this angle from the aiming direction.' })
    public maxRootAngle : number = 45.0;

    @property({ tooltip: 'If enabled, aligns the root forward to target direction after Max Root Angle has been exceeded.' })
    public turnToTarget : boolean = true;

    @property({ tooltip: 'The time of turning towards the target direction if Max Root Angle has been exceeded and Turn To Target is enabled.' })
    public turnToTargetTime : number = 0.2;

    @property({ tooltip: 'If true, AimIK will consider whatever the current direction of the weapon to be the forward aiming direction and work additively on top of that. This enables you to use recoil and reloading animations seamlessly with AimIK. Adjust the Vector3 value below if the weapon is not aiming perfectly forward in the aiming animation clip.' })
    public useAnimatedAimDirection: boolean = false;

    @property({ tooltip: 'The direction of the animated weapon aiming in character space. Tweak this value to adjust the aiming. Use Animated Aim Direction must be enabled for this property to work.' })
    public animatedAimDirection: Vec3 = new Vec3(0, 0, 1);

    private _lastTarget : Node | null = null;
	private _switchWeight : number = 0;
    private _switchWeightV : number = 0;
    private _weightV : number = 0;
    private _lastPosition : Vec3 = new Vec3();
    private _dir : Vec3 = new Vec3();
    private _lastSmoothTowardsTarget:boolean = false;

    private turningToTarget : boolean = false;
    private turnToTargetMlp : number = 1.0;
    private turnToTargetMlpV: number = 0.0;
    private _interval: any;

    start () {
    	this._lastPosition = Vec3.clone(this.ik!.solver.ikPosition);
    	Vec3.subtract(this._dir, this.ik!.solver.ikPosition, this._getPivot());
        this.ik!.solver.target = this.target;
    }

    lateUpdate () {
    	// If target has changed...
    	if (this.target != this._lastTarget) {
    		if (this._lastTarget == null && this.target != null && this.ik!.solver.ikPositionWeight <= 0.0)
    		{
    			this._lastPosition = Vec3.clone(this.target.getWorldPosition());
    			Vec3.subtract(this._dir, this.target.getWorldPosition(), this._getPivot());
    			Vec3.add(this.ik!.solver.ikPosition, this.target.getWorldPosition(), this.offset!);
    		}
    		else
    		{
    			this._lastPosition = Vec3.clone(this.ik!.solver.ikPosition);
    			Vec3.subtract(this._dir, this.ik!.solver.ikPosition, this._getPivot());
    		}
    		this._switchWeight = 0.0;
    		this._lastTarget = this.target;
    	}

    	// Smooth weight
    	let outValue = { value: this._weightV };
        this.ik!.solver.ikPositionWeight = MathUtil.smoothDamp(this.ik!.solver.ikPositionWeight, (this.target != null ? this.weight : 0), outValue, this.weightSmoothTime);
        this._weightV = outValue.value;

        if (this.ik!.solver.ikPositionWeight >= 0.999) this.ik!.solver.ikPositionWeight = 1.0;
        if (this.ik!.solver.ikPositionWeight <= 0.001) this.ik!.solver.ikPositionWeight = 0.0;

        if (this.ik!.solver.ikPositionWeight <= 0.0) return;
        // Smooth target switching
        outValue.value = this._switchWeightV;
        this._switchWeight = MathUtil.smoothDamp(this._switchWeight, 1.0, outValue, this.targetSwitchSmoothTime);
        this._switchWeightV = outValue.value;
        if (this._switchWeight >= 0.99) this._switchWeight = 1.0;

        if (this.target != null) {
        	Vec3.add(_tempVec3, this.target.getWorldPosition(), this.offset!);
        	Vec3.lerp(this.ik!.solver.ikPosition, this._lastPosition, _tempVec3, this._switchWeight);
        }

        // Smooth turn towards target
        if (this.smoothTurnTowardsTarget != this._lastSmoothTowardsTarget) {
        	Vec3.subtract(this._dir, this.ik!.solver.ikPosition, this._getPivot());
        	this._lastSmoothTowardsTarget = this.smoothTurnTowardsTarget;
        }

        // fromViewUp
        if (this.smoothTurnTowardsTarget) {
        	// Vector3 targetDir = ik.solver.ikPosition - pivot;
        	// dir = Vector3.Slerp(dir, targetDir, Time.deltaTime * slerpSpeed);
        	// dir = Vector3.RotateTowards(dir, targetDir, Time.deltaTime * maxRadiansDelta, maxMagnitudeDelta);
        	// ik.solver.ikPosition = pivot + dir;
        	// get targetDir
        	Vec3.subtract(_tempVec3, this.ik!.solver.ikPosition, this._getPivot());
        	Quat.fromViewUp(_tempQuat, _tempVec3, new Vec3(0, 1, 0));
        	Quat.toEuler(this._dir, _tempQuat);
        	Vec3.add(this.ik!.solver.ikPosition, this._getPivot(), this._dir);
            //console.log('ikPosition:',this.ik!.solver.ikPosition);
        }

        // Min distance from the pivot
        this._applyMinDistance();
        // Root rotation
        this._rootRotation();

        // Offset mode
        if (this.useAnimatedAimDirection) {
        	Vec3.transformQuat(_tempVec3, this.animatedAimDirection, this.ik!.rootNode!.getWorldRotation());
        	// MathUtil.directionToNodeSpace(this.ik!.solver.axis, _tempVec3, this.ik!.solver!.aimNode!);
            this.ik!.rootNode!.inverseTransformPoint(this.ik!.solver.axis, _tempVec3);
        }
    }

    
    _getPivot () {
    	//   this.ik!.transform.position + this.ik!.transform.rotation * this.pivotOffsetFromRoot;
    	//let tempVec3 = new Vec3();
    	Vec3.transformQuat(tempPivot, this.pivotOffsetFromRoot, this.ik!.rootNode!.getWorldRotation());
    	Vec3.add(tempPivot, tempPivot, this.ik!.rootNode!.getWorldPosition());
    	return tempPivot; //Vec3.clone(this.tempPivot);
    }

    // Make sure aiming target is not too close (might make the solver instable when the target is closer to the first bone than the last bone is).
    _applyMinDistance () {
    	//_tempVec3 = this._getPivot();
        UtilVec3.copy(_tempVec3, this._getPivot());
    	Vec3.subtract(_tempVec3_2, this.ik!.solver.ikPosition, _tempVec3);
    	let distance = Math.max(_tempVec3_2.length(), this.minDistance);
    	_tempVec3_2.normalize();
    	_tempVec3_2.multiplyScalar(distance);
    	Vec3.add(this.ik!.solver.ikPosition, _tempVec3, _tempVec3_2);
    }

    // Character root will be rotate around the Y axis to keep root forward within this angle from the aiming direction.
    private _rootRotation () {
        let maxRootAngle = this.ik!.enableAim ? this.maxRootAngle : 0;
    	let max = math.lerp(180.0, maxRootAngle * this.turnToTargetMlp, this.ik!.solver.ikPositionWeight);
    	if (max < 180.0) {
    		Quat.invert(_tempQuat, this.ik!.rootNode!.getWorldRotation());
    		Vec3.subtract(_tempVec3, this.ik!.solver.ikPosition, this._getPivot());
    		Vec3.transformQuat(_tempVec3, _tempVec3, _tempQuat);

    		let angle = math.toDegree(Math.atan2(_tempVec3.x, _tempVec3.z));

    		let rotation = 0.0;

    		if (angle > max) {
    			rotation = angle - max;
    			if (!this.turningToTarget && this.turnToTarget) this._startCoroutine(this._turnToTarget.bind(this));
    		}
    		if (angle < -max) {
    			rotation = angle + max;
    			if (!this.turningToTarget && this.turnToTarget) this._startCoroutine(this._turnToTarget.bind(this));
    		}

    		// Quaternion.AngleAxis(rotation, ik.transform.up) * ik.transform.rotation;
    		// let character = this.ik!.getComponent("CharacterOrientation") as CharacterOrientation;
    		// character!.getUpdirection(_tempVec3);

    		Quat.fromAxisAngle(_tempQuat, Vec3.UP, math.toRadian(rotation));
    		Quat.multiply(_tempQuat, _tempQuat, this.ik!.rootNode!.getWorldRotation());
            this.ik!.rootNode!.setWorldRotation(_tempQuat);
    	}
    }

    // // Aligns the root forward to target direction after "Max Root Angle" has been exceeded.
    private _turnToTarget ()
    {
    	this.turningToTarget = true;

    	while (this.turnToTargetMlp > 0.0)
    	{
    		// this.turnToTargetMlp = Mathf.SmoothDamp(turnToTargetMlp, 0f, ref turnToTargetMlpV, turnToTargetTime);
    		this.turnToTargetMlp -= director.getDeltaTime();
    		if (this.turnToTargetMlp < 0.01) this.turnToTargetMlp = 0.0;
    		return;
    	}

    	clearInterval(this._interval);
    	this._interval = null;
    	this.turnToTargetMlp = 1;
    }

    private _startCoroutine (fb:Function) {
    	if (this._interval) {
    		clearInterval(this._interval);
    	}
    	this._interval = setInterval(fb);
    }
}
