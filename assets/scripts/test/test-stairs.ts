import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
import { UtilVec3 } from '../core/util/util';
import { Res } from '../core/res/res';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestStairs')
@executeInEditMode
export class TestStairs extends Component {

    @property
    count = 10;

    @property
    height = 10;

    @property
    angle = 45;

    @property(Vec3)
    vector = v3(0, 0, 0);

    onEnable() {

        if(EDITOR) {

            if(this.node.children.length > 1) return;

            let position = v3(0, 0, 0);

            const board = this.node.children[0];

            UtilVec3.copy(position, board.position);

            for(let i = 10; i < this.count; i++) {
                position.add(this.vector);
                const newBoard = Res.instNode(board, this.node, position);
                newBoard.setScale(board.scale);
            }

        }

    }

}

