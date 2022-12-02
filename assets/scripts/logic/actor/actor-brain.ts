import { _decorator, Component, find, Vec2, PhysicsSystem, input, Input, EventMouse, geometry, Camera, game, EventTouch, director, Vec3, v3, v2, random } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { SensorRaysAngle } from '../../core/sensor/sensor-rays-angle';
import { Navigation } from '../navigation/navigation-map';
import { Actor } from './actor';
import { ActorInputBrain } from './actor-input-brain';

const { ccclass } = _decorator;

@ccclass('ActorBrain')
export class ActorBrain extends Component {

    _actor:ActorBase = null;
    _wayPoints:Vec3[] = [];
    _moveDir:Vec3 = v3(0, 0, 1);
    _rotation:Vec2 = v2(0, 0);
    input:ActorInputBrain;
    sensorEnemy:SensorRaysAngle;
    is_waypoints_move = false;
    waypointsIndex = 1;

    start() {
        this._actor = this.getComponent(ActorBase);
        this.input = this.getComponent(ActorInputBrain);
        
        //Add Sensor-rays-angle
        const prefab = ResCache.Instance.getPrefab('sensor_enemy');
        const sensorNode = Res.inst(prefab, this.node);
        this.sensorEnemy = sensorNode.getComponent(SensorRaysAngle);
    }

    onMove() {
        this.input.onMove(this._moveDir);
        this.input.onDir(this._rotation.x, this._rotation.y);
        this.input.onRun(random() < 0.05);
    }

    onJump() {
        this.input.onJump();
    }

    calculateNextPosition() {

        this._wayPoints = Navigation.calculateRandomPoint(this._actor.node.worldPosition);
        this.is_waypoints_move = true;
        this.waypointsIndex = 0;

    }

    checkFire() {
        if(this.sensorEnemy.checkedNode) {
            //this.input.onFire();
        }
    }

    update(deltaTime:Number) {

        if(this.is_waypoints_move) {
            const wpos = this._actor.node.worldPosition;
            const target = this._wayPoints[this.waypointsIndex];
            if(Vec3.distance(wpos, target) <= 0.1) {
                // Next way
                this.waypointsIndex++;
                if(this.waypointsIndex >= this._wayPoints.length) this.is_waypoints_move = false;
            }else{
                this._rotation.x = target.x - wpos.x;
                this._rotation.y = target.z - wpos.z;
                this._moveDir.x = 0;
                this._moveDir.y = 0;
                this._moveDir.z = -1;
                this.onMove();
                if(random() < 0.1) this.onJump();
            }
        }else{
            this.calculateNextPosition();
        }

        this.checkFire();

    }

}