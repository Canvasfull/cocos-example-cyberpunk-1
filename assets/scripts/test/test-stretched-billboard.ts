import { _decorator, Component, math, Node } from 'cc';
import { EDITOR } from 'cc/env';
import { GMath } from '../core/util/g-math';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('TestStretchedBillboard')
@executeInEditMode
export class TestStretchedBillboard extends Component {

    @property(Node)
    target:Node | undefined;

    @property(Node)
    current:Node | undefined;

    @property
    updateTime:number = 3;

    start() {

    }

    update(deltaTime: number) {

        if(EDITOR) {

            const billboardAngle = GMath.StretchedBillboardAngle(this.current!.up, this.current!.worldPosition, this.target!.worldPosition, this.current!.forward);

            if(billboardAngle) {
                const angle = this.node.eulerAngles;
                this.current!.setRotationFromEuler(angle.x, angle.y, billboardAngle);
            }

        }
        
    }

}

