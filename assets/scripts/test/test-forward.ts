import { _decorator, Component, geometry, Node, v3 } from 'cc';
import { Gizmo, UtilVec3 } from '../core/util/util';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('test_forward')
@executeInEditMode
export class test_forward extends Component {

    onEnable() {

    }

    update(deltaTime: number) {
        
        if(EDITOR) {
            let endPosition = v3(0, 0, 0);
            UtilVec3.copy(endPosition, this.node.worldPosition);
            endPosition.add(this.node.forward);
            Gizmo.drawLine(this.node.worldPosition, endPosition);
        }
        
    }
}

