import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DelayPlay')
export class DelayPlay extends Component {


    @property([Animation])
    animations = [];

    @property([Number])
    delay = [];

    @property([String])
    animation_names = [];

    start() {

        

    }

}

