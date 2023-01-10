import { _decorator, Color, Component, Node, Quat, v3, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { Gizmo } from '../core/util/util';
import { TestNormal } from './test-normal';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestSlopeDirection')
@executeInEditMode
export class TestSlopeDirection extends Component {

    @property(TestNormal)
    playerNode:TestNormal | undefined | null;

    @property(Vec3)
    moveDirection:Vec3 = v3(0, 0, 0);

    update(deltaTime: number) {

        if(EDITOR) {

            Gizmo.drawLine(this.node.worldPosition, this.moveDirection, Color.MAGENTA);

            const direction = this.playerNode!.direction;

            const planeNormal = this.playerNode!.normal;

            let project = v3(0, 0, 0);

            Vec3.projectOnPlane(project, project, planeNormal);

            Gizmo.drawLine(this.playerNode!.startPos, project, Color.YELLOW);

        }
        
    }
}

