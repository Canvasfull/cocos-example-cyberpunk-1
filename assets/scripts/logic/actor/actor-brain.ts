import { _decorator, Component, find, Vec2, Vec3, v3, v2, random, IVec3Like, randomRangeInt, Node, math, game } from 'cc';
import { SensorRaysAngle } from '../../core/sensor/sensor-rays-angle';
import { UtilNode, UtilVec3 } from '../../core/util/util';
import { NavSystem } from '../navigation/navigation-system';
import { ActorInputBrain } from './actor-input-brain';
import { Level } from '../level/level';
import { NavigationPoint } from '../navigation/navigation-point';
import { Actor } from './actor';

const { ccclass } = _decorator;

let tempRotationSideVector = v3(0, 0, 0);

@ccclass('ActorBrain')
export class ActorBrain extends Component {

    _actor:Actor | undefined;
    _wayPoints:NavSystem.NavPointType[] = [];
    _moveDir:Vec3 = v3(0, 0, 1);
    targetDirection:Vec3 = v3(0, 0, 0);
    input:ActorInputBrain | undefined;
    sensorRays:SensorRaysAngle | undefined;
    is_waypoints_move = false;
    waypointsIndex = 1;
    nearestNode = -1;

    _targetNode:Node | undefined;

    targetPosition:Vec3 = v3(0, 0, 0);

    // fire move 
    waypointsFireIndex = -1;
    waypointsFire:Array<Vec3> | undefined;
    fireDirection = v3(0, 0, 0);

    reloadTime = 0;

    // Follow paths direction.
    followPathsDirection = 1;

    start() {
        this._actor = this.getComponent(Actor)!;
        this.input = this.getComponent(ActorInputBrain)!;
        //const prefab = ResCache.Instance.getPrefab('sensor_enemy');
        //const sensorNode = Res.inst(prefab, this.node);
        const sensorNode = this.node.getChildByName('sensor_target')!;
        this.sensorRays = sensorNode.getComponent(SensorRaysAngle)!;
        this.nearestNode = this._actor._data.nearest;

        if (this._actor === undefined || this.input === undefined || this.sensorRays === undefined) {
            throw new Error(`${this.node.name} node lose components : ActorBase or ActorInputBrain.`);
        }        
    }

    onMove() {
        this.input!.onMove(this._moveDir);
        this.input!.onRotation(this.targetDirection.x, this.targetDirection.z);
        this.input!.onRun(random() < 0.05);
    }

    onJump() {
        this.input?.onJump();
    }

    onCrouch() {
        this.input?.onCrouch();
    }

    onProne() {
        this.input?.onProne();
    }

    onFire() {
        this.input?.onFire();
    }

    update(deltaTime:Number) {

        if(!this._actor!.isReady) return;

        // Check if dead.
        if(this._actor?._data.is_dead) return;

        if(Level.Instance._player._data.is_dead) return;

        // Check near has player.
        this.checkNearPlayer();

        //this._targetNode = undefined;

        //console.log('target node:', this._targetNode);

        // Go target position.

        // Find target look at target and shoot.
        if(this._targetNode !== undefined) {
            this.shootFire();
        }else{ // Random move and find target.
            this.randomMove();
            this.input?.onAim(false);
        }

    }

    shootFire() {

        // Fire move.
        this.moveFire();

        // Wait reload weapon.
        if(this.reloadTime > 0) {
            this.reloadTime -= game.deltaTime;
            return;
        }

        // Check bullet empty.
        if(this._actor?._actorEquipment?.currentEquip?.isBulletEmpty) {
            // Reload Bullet.
            this.input?.onReload();
            this.reloadTime = 3;
            return;
        }

        this.input?.onAim(true);
        // Check fire.
        this.checkFire();
    }

    randomMove() {
        this.waypointsFireIndex = -1;
        if (this.is_waypoints_move) {
            this.PathsFollowing();
        }else{
            this.calculateNextPosition();
        }
    }

    PathsFollowing() {

        if (this.is_waypoints_move) {

            const worldPosition = this._actor!.node.worldPosition;
            const target = this._wayPoints[this.waypointsIndex];

            UtilVec3.copy(this.targetPosition, target);

            // Detects if there is a character ahead.
            /*
            if(this.sensorRays?.checkedNode) {
                this.followPathsDirection = -1;
            }else{
                this.followPathsDirection = 1;
            }
            */

            // Detect distance to target point.
            if (Vec3.distance(worldPosition, target) <= 1) {

                // Arrive current node.
                this.waypointsIndex += this.followPathsDirection;

                if(this.waypointsIndex >= this._wayPoints.length || this.waypointsIndex < 0) this.is_waypoints_move = false;
                else this.nearestNode = this._wayPoints[this.waypointsIndex].id;

            }else{

                // Calculate move direction.
                UtilVec3.copy(this.targetDirection, this.targetPosition);
                this.targetDirection.y = worldPosition.y;
                this.targetDirection.subtract(worldPosition).normalize();

                this._moveDir.x = -this.targetDirection.x;
                this._moveDir.y = 0;
                this._moveDir.z = -this.targetDirection.z;

                // Calculates the rotation angle of the target.
                this.lookAtTarget(this._moveDir);

                // 
                this.onMove();

                // Random Jump.
                //if (random() < 0.05) this.onJump();
            }
        } 
    }

    followTargetPaths() {

        

    }

    lookAtTarget(lookAtDirection:Vec3) {

        UtilVec3.copy(tempRotationSideVector, lookAtDirection);
        const angle = Math.abs(Vec3.angle(lookAtDirection, this.node.forward));
        if (angle > 0.001) {
            const side = Math.sign(-tempRotationSideVector.cross(this.node.forward).y);
            this.targetDirection.x = side * angle;// game.deltaTime;
            this.targetDirection.z = 0;
        }
    }

    moveFire() {

        if(this.waypointsFireIndex === -1) {
            this.nearestNode = NavSystem.findNearest(this._actor!.node.worldPosition);
            this.waypointsFire = NavSystem.randomFirePath(this.nearestNode);
            this.waypointsFireIndex = 0;
        }

        const worldPosition = this._actor!.node.worldPosition;
        let target = this.waypointsFire![this.waypointsFireIndex];

        UtilVec3.copy(this.targetPosition, target);

        const targetDistance = Vec3.distance(worldPosition, target);

        //console.log('target distance:', targetDistance);

        if (targetDistance <= 1) {

            // Next way
            this.waypointsFireIndex++;

            if (this.waypointsFireIndex >= this.waypointsFire!.length) {

                this.nearestNode = NavSystem.findNearest(this._actor!.node.worldPosition);
                this.waypointsFire = NavSystem.randomFirePath(this.nearestNode);
                this.waypointsFireIndex = 0;
                target = this.waypointsFire![this.waypointsFireIndex];
            }
        }

        // Calculate move direction.
        UtilVec3.copy(this.targetDirection, this.targetPosition);
        this.targetDirection.y = worldPosition.y;
        this.targetDirection.subtract(worldPosition).normalize().multiplyScalar(0.3);

        this._moveDir.x = -this.targetDirection.x;
        this._moveDir.y = 0;
        this._moveDir.z = -this.targetDirection.z;

        // Look at direction.
        const player = Level.Instance._player;

        UtilVec3.copy(this.targetDirection, worldPosition);

        this.targetDirection.y += player._data.is_crouch ? 0.3 : 1;
        this.targetDirection.subtract(player.node.worldPosition).normalize();
        this.lookAtTarget(this.targetDirection);

        this.onMove();

        //if (random() < 0.1) this.onJump();

    }

    checkFire() {

        // Check shoot angle.
        const player = Level.Instance._player;
        const forward = this._actor?.node.forward!;//this._actor?._forwardNode!.forward!;
        UtilVec3.copy(this.fireDirection, player.node!.worldPosition);
        this.fireDirection.subtract(this._actor!.node.worldPosition);
        const angle = math.toDegree(Vec3.angle(forward, this.fireDirection));

        //console.log('fire angle:',  angle);

        if(angle < 10) this.onFire();
    }

    freePathMove() {
        this._wayPoints = NavSystem.randomPaths(this._actor!.node.worldPosition, randomRangeInt(5, 10), this.nearestNode);
        //Navigation.calculateRandomPoint(this._actor!.node.worldPosition);
        console.log('this._wayPoints:', this._wayPoints);
        this.is_waypoints_move = true;
        this.waypointsIndex = 0;
    }

    fleeTarget() {
        // calculate flee.
    }

    followTarget() {
        // calculate target.
        this._wayPoints = NavSystem.findPaths(this._actor!.node.worldPosition, this.nearestNode, Level.Instance._player!.node.worldPosition);

    }

    checkNearPlayer() {

        if(Level.Instance._player == undefined) return undefined;

        const player = Level.Instance._player;
        const data = this._actor!._data;
        const distance = Vec3.distance(player.node.worldPosition, this._actor!.node.worldPosition);

        //console.log('target distance:', distance, ' nearby distance:', data._ai_nearby_distance);

        if(distance < data.ai_nearby_distance) {
            this._targetNode = player.node;
        }else{
            this._targetNode = undefined;
        }

    }

    calculateNextPosition() {
        this._wayPoints = NavSystem.randomPaths(this._actor!.node.worldPosition, randomRangeInt(5, 10), );
        if(this._wayPoints.length === 0) {
            console.warn(`${this.node.name} can not find path`);
            return;
        }
        //console.log('this._wayPoints:', this._wayPoints);
        this.is_waypoints_move = true;
        this.waypointsIndex = 0;
    }


}