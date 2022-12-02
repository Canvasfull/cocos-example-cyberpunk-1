import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('actor_main')
export class actor_main extends Component {

    public static target = Object.create(null);

    start () {
        actor_main.target = this.node;
    }

    update (deltaTime: number) {

    }

}

