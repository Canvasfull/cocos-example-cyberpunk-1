import { _decorator, Component, Node } from 'cc';
import { fx } from './fx';
const { ccclass, property } = _decorator;

@ccclass('FxInit')
export class FxInit extends Component {

    start() {
        fx.init(this.node);
    }

}

