import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ActorMain')
export class ActorMain extends Component {

    public static target = Object.create(null);

    start () {
        ActorMain.target = this.node;
    }

    update (deltaTime: number) {

    }

}

