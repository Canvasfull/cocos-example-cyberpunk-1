import { _decorator, Component, Node, Label, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('jump_points')
export class jump_points extends Component {

    label: Label;
    real_points = 0;
    cur_points = 0;

    speed = 0;
    a = 1;

    str: string = '';

    onEnable () {
        console.log('************* on jump points. ************ ');
        this.label = this.node.getComponent(Label);
        this.node.on('set_points', (points: number, str: string = 's') => {
            this.str = str;
            this.cur_points = 0;
            this.real_points = points;
            this.speed = 0;
            this.a = 1;
            console.log('----------- set points:', this.real_points);
        })
    }
    update (deltaTime: number) {

        if (this.cur_points < this.real_points) {
            this.speed += this.a;
            this.cur_points += deltaTime * this.speed;
            if (this.cur_points > this.real_points) this.cur_points = this.real_points;
            var show_num = Math.ceil(this.cur_points);
        }

    }
}

