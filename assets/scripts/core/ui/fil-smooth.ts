import { _decorator, Component, Node, Sprite, math, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FilSmooth')
export class FilSmooth extends Component {

    fil_value: Sprite = Object.create(null);
    value: number = 1;

    @property
    smooth: number = 10;

    start() {
        this.fil_value = this.getComponent(Sprite);
    }

    setValue(value: number) {
        this.value = value;
    }

    update(deltaTime: number) {
        var delta = Math.abs(this.fil_value.fillRange - this.value);
        if (delta != 0) {
            this.fil_value.fillRange = math.lerp(this.fil_value.fillRange, this.value, game.deltaTime * this.smooth);
            if (delta < 0.0001) this.fil_value.fillRange = this.value;
        }
    }

}

