import { _decorator, Component, Node, v3, Vec2, Vec3 } from 'cc';
import { UtilVec3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

@ccclass('FxRayLine')
export class FxRayLine extends Component {

    direction:Vec3 = v3(0, 0, 0);

    public setRayLine(start:Vec3, end:Vec3) {

        UtilVec3.copy(this.direction, end);
        this.direction.subtract(start);
        const length = this.direction.length();
        //this.node.lookAt(this.direction);
        this.node.setScale(0.1, 1, length);

    }
}

