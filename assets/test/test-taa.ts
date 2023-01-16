import { _decorator, Component, Node, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('test_taa')
export class test_taa extends Component {
    @property(Node)
    temp: Node | undefined

    start () {
        if (!this.temp) return;
        globalThis.test_taa = this;

    }

    create () {
        let temp = instantiate(this.temp)!
        temp.parent = this.node.parent
        this.node.active = false
    }
}


