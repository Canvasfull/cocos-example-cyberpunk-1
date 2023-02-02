import { _decorator, Component, math, Node, RigidBody, v3, Vec3 } from 'cc';
import { ActorMoveSlope } from './actor-move-slope';
import { UtilVec3 } from '../../core/util/util';
import { SensorSlope } from '../../core/sensor/sensor-slope';
import { SensorGround } from '../../core/sensor/sensor-ground';
import { fun } from '../../core/util/fun';
const { ccclass, property } = _decorator;

let tempRotationSideVector = v3(0, 0, 0);

@ccclass('ActorMove')
export class ActorMove extends Component {

    @property( { type: Number, tooltip: 'Move Speed. '})
    speed = 1;

    @property( { type: Vec3, tooltip: 'Jump Force.' })
    jumpForce = v3(0, 6.0, 0);

    @property( { type: Number, tooltip:'Move smooth value.'})
    smoothMove = 5;

    @property( { type: Number, tooltip: 'Default angle value' })
    angleVertical = 0;

    @property( { type: SensorSlope, tooltip: ' Sensor slope.' })
    sensorSlop: SensorSlope | undefined;

    @property( { type: SensorGround, tooltip: ' Sensor ground.' })
    sensorGround: SensorGround | undefined;
    
    velocity = v3(0, 0, 0);
    velocityLocal = v3(0, 0, 0);
    currentVelocity:Vec3 = v3(0, 0, 0);
    moveVec3 = new Vec3(0, 0, 0);

    currentDirection = v3(0, 0, 0);
    direction = v3(0, 0, 0);
    angleHead  = 0;

    rigid:RigidBody | undefined;

    @property
    angleVerticalMax = 30;

    @property
    angleVerticalMin = -30;

    @property
    faceMove = true;

    angle = 0;

    isJump = false;

    isStopMove= false;

    start() {

        this.rigid = this.getComponent(RigidBody)!;
        this.sensorSlop = this.getComponent(SensorSlope)!;
        this.sensorGround = this.getComponent(SensorGround)!;
    }

    lateUpdate(deltaTime: number) {
        if(this.isStopMove) return;
        this.movePosition(deltaTime);
        this.moveRotation();
    }

    movePosition(deltaTime : number) {

        //Lerp velocity.
        Vec3.lerp(this.velocityLocal, this.velocityLocal, this.moveVec3, deltaTime * this.smoothMove);
        UtilVec3.copy(this.velocity, this.velocityLocal);

        //rotate y.
        if(this.faceMove)
            Vec3.rotateY(this.velocity, this.velocity, Vec3.ZERO, math.toRadian(this.node.eulerAngles.y));

        this.rigid?.getLinearVelocity(this.currentVelocity);
        this.velocity.y = this.currentVelocity.y;

        if(this.sensorGround?._isGround && this.sensorSlop!.checkSlope(this.velocity)) {
            const moveLength = this.velocity.length();
            UtilVec3.copy(this.velocity, this.sensorSlop!.vectorSlop);
            this.velocity.normalize().multiplyScalar(moveLength);
        }

        this.rigid?.setLinearVelocity(this.velocity);
    }

    moveRotation() {
        UtilVec3.copy(this.currentDirection, this.direction);
        this.angle = Math.abs(Vec3.angle(this.currentDirection, this.node.forward));
        if (this.angle > 0.001) {
            UtilVec3.copy(tempRotationSideVector, this.currentDirection);
            const side = Math.sign(-tempRotationSideVector.cross(this.node.forward).y);
            //var angleVel = new Vec3(0, side * angleAbs * 5, 0);
            //this.rigid?.setAngularVelocity(angleVel);
            const angle = side * this.angle * 5 + this.node.eulerAngles.y;
            this.node.setRotationFromEuler(0, angle, 0);
        }
    }

    moveDirection(direction:Vec3) {
        UtilVec3.copy(this.moveVec3, direction);
        this.moveVec3.multiplyScalar(this.speed);
    }

    jump() {
        //this.rigid?.applyImpulse(this.jumpForce);
        this.rigid?.getLinearVelocity(this.currentVelocity);
        this.currentVelocity.y = 7;
        this.rigid?.setLinearVelocity(this.currentVelocity);
    }

    onRotation(x: number, y: number) {
        this.angleHead += x;
        this.direction.z = -Math.cos(Math.PI / 180.0 * this.angleHead);
        this.direction.x = Math.sin(Math.PI / 180.0 * this.angleHead);
        this.angleVertical -= y;
        if (this.angleVertical >= this.angleVerticalMax) 
            this.angleVertical = this.angleVerticalMax;

        if (this.angleVertical <= this.angleVerticalMin)
            this.angleVertical = this.angleVerticalMin;
    }

    onDirection(x: number, y: number, z:number) {

        this.direction.x = x;
        this.direction.z = z;

        this.angleVertical = y;
        if (this.angleVertical >= this.angleVerticalMax) 
            this.angleVertical = this.angleVerticalMax;

        if (this.angleVertical <= this.angleVerticalMin)
            this.angleVertical = this.angleVerticalMin; 
        
    }

    stop() {
        this.rigid!.getLinearVelocity(this.velocity);
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.rigid!.setLinearVelocity(this.velocity);
    }


}

