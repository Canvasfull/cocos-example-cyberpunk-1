import { _decorator, Color, Component, Node, Quat, v3, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { Gizmo, UtilVec3 } from '../core/util/util';
import { TestNormal } from './test-normal';
import { TestSlopeVector } from './test-slope-vector';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestSlopeDirection')
@executeInEditMode
export class TestSlopeDirection extends Component {

    @property(TestNormal)
    playerNode:TestNormal | undefined | null;

    @property(Vec3)
    moveDirection:Vec3 = v3(0, 0, 0);

    @property(TestSlopeVector)
    slopeDirection:TestSlopeVector | undefined | null;

    endPosition = v3(0, 0, 0);

    update(deltaTime: number) {

        if(EDITOR) {

            UtilVec3.copy(this.endPosition, this.node.worldPosition);

            this.endPosition.add(this.moveDirection);

            Gizmo.drawLine(this.node.worldPosition, this.endPosition, Color.MAGENTA);

            UtilVec3.copy(this.slopeDirection!.direction, this.moveDirection);

            //const direction = this.playerNode!.direction;
            //const planeNormal = this.playerNode!.normal;
            //let project = v3(0, 0, 0);
            //Vec3.projectOnPlane(project, project, planeNormal);

            UtilVec3.copy(this.endPosition, this.node.worldPosition);

            this.endPosition.add(this.slopeDirection!.vectorSlop);

            Gizmo.drawLine(this.node.worldPosition, this.endPosition, Color.YELLOW);

        }
        
    }
}

