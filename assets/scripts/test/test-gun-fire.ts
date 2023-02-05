import { _decorator, Component, Node } from 'cc';
import { ActorEquipBase } from '../logic/actor/actor-equip-base';
import { TestAnimationGraph } from './test-anig';
const { ccclass, property } = _decorator;

@ccclass('test_gun_fire')
export class test_gun_fire extends Component {
    start() {

        for(let i = 0 ;i < this.node.children.length; i++) {
            const child = this.node.children[i];
            //child.getComponent(ActorEquipBase)!.enabled = false;
            child.addComponent(TestAnimationGraph);
        }

    }

    update(deltaTime: number) {
        
    }
}

