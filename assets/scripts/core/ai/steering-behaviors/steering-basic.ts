import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { UtilVec3 } from '../../util/util';
const { ccclass, property } = _decorator;

@ccclass('SteeringBasic')
export class SteeringBasic extends Component {

    moveVelocity = v3(0, 0, 0);
    desiredVelocity = v3(0, 0, 0);

    target:Node | undefined;



}