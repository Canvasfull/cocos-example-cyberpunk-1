import { _decorator, Component, find, Vec2, Vec3, v3, v2, random, IVec3Like, randomRangeInt, Node } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { SensorRaysAngle } from '../../core/sensor/sensor-rays-angle';
import { UtilNode } from '../../core/util/util';
import { NavPoints } from '../navigation/navigation-system';
import { ActorInputBrain } from './actor-input-brain';

const { ccclass } = _decorator;

@ccclass('ActorBrain')
export class ActorBrain extends Component {

    _actor:ActorBase | undefined;
    _wayPoints:NavPoints.NavPointType[] = [];
    _moveDir:Vec3 = v3(0, 0, 1);
    _rotation:Vec2 = v2(0, 0);
    input:ActorInputBrain | undefined;
    sensorRays:SensorRaysAngle | undefined;
    is_waypoints_move = false;
    waypointsIndex = 1;
    nearestNode = -1;

    _targetNode:Node | undefined;

    start() {
        this._actor = this.getComponent(ActorBase)!;
        this.input = this.getComponent(ActorInputBrain)!;
        const prefab = ResCache.Instance.getPrefab('sensor_enemy');
        const sensorNode = Res.inst(prefab, this.node);
        this.sensorRays = sensorNode.getComponent(SensorRaysAngle)!;
        this._targetNode = UtilNode.getChildByName(this.node, 'target_pos');
        this.nearestNode = this._actor._data.nearest;

        if (this._actor === undefined || this.input === undefined || this.sensorRays === undefined) {
            throw new Error(`${this.node.name} node lose components : ActorBase or ActorInputBrain.`);
        }        
    }

    onMove() {
        this.input!.onMove(this._moveDir);
        this.input!.onDir(this._rotation.x, this._rotation.y);
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

        if (this.is_waypoints_move) {
            this.move();
        }else{
            this.calculateNextPosition();
        }

        this.checkFire();

    }

    move() {
        if (this.is_waypoints_move) {
            const worldPosition = this._actor!.node.worldPosition;
            const target = this._wayPoints[this.waypointsIndex];
            this._targetNode?.setWorldPosition(target.x, target.y, target.z);
            if (Vec3.distance(worldPosition, target) <= 1) {
                // Next way
                this.waypointsIndex++;
                if (this.waypointsIndex >= this._wayPoints.length) this.is_waypoints_move = false;
                else this.nearestNode = this._wayPoints[this.waypointsIndex].id;
            }else{
                this._rotation.x = target.x - worldPosition.x;
                this._rotation.y = target.z - worldPosition.z;
                this._moveDir.x = 0;
                this._moveDir.y = 0;
                this._moveDir.z = -1;
                this.onMove();
                if (random() < 0.1) this.onJump();
            }
        } 
    }

    checkFire() {
        if (this.sensorRays!.checkedNode) {
            //this.input.onFire();
        }
    }

    freePathMove() {
        this._wayPoints = NavPoints.randomPaths(this._actor!.node.worldPosition, randomRangeInt(5, 10), this.nearestNode);
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
    }

    calculateNextPosition() {
        this._wayPoints = NavPoints.randomPaths(this._actor!.node.worldPosition, randomRangeInt(5, 10), );
        if(this._wayPoints.length === 0) {
            console.warn(`${this.node.name} can not find path`);
            return;
        }
        console.log('this._wayPoints:', this._wayPoints);
        this.is_waypoints_move = true;
        this.waypointsIndex = 0;
    }



}