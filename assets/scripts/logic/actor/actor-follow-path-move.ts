import { _decorator, Component, find, Vec2, PhysicsSystem, input, Input, EventMouse, geometry, Camera, game, EventTouch, director, Vec3, v3, v2 } from 'cc';
import { ActorBase } from '../../core/actor/actor-base';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
import { SensorRaysAngle } from '../../core/sensor/sensor-rays-angle';
import { Navigation } from '../navigation/navigation-map';
import { Actor } from './actor';
import { ActorInputBrain } from './actor-input-brain';

const { ccclass } = _decorator;

@ccclass('ActorBrain')
export class ActorFollowPathMove extends Component {



    //public setMove()

}