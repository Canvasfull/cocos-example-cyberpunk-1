import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('delay_play')
export class delay_play extends Component {


    @property([Animation])
    animations = [];

    @property([Number])
    delay = [];

    @property([String])
    animation_names = [];

    start() {

        

    }

}

