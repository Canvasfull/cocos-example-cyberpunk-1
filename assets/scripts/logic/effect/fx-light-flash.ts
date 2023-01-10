import { _decorator, Color, Component, Material, math, MeshRenderer, Node, randomRange, randomRangeInt } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FxLightFlash')
export class FxLightFlash extends Component {

    matLight:Material | undefined | null;

    lightColor:Color = new Color(255, 255, 255, 255);

    lightValueMax = 10;

    lightValueMin = 200;

    length = 0;

    flashTimes = 3;

    value = 0;

    t = 0;

    smooth = 10;

    isFlash = false;

    start() {

        this.matLight = this.node.getComponent(MeshRenderer)?.materials[0];

        this.onFlash();

    }

    onFlash() {

        this.flashTimes = randomRangeInt(1, 5);

        this.lightValueMax = 255;

        this.lightValueMin = randomRangeInt(180, 200);

        this.length = this.lightValueMax - this.lightValueMin;

        this.value = this.lightValueMax;

    }

    update(deltaTime: number) {

        this.t += deltaTime;
        
        this.value = math.pingPong(this.t * this.smooth, this.length) + this.lightValueMin;
        this.lightColor.a = this.value;
        this.lightColor.g = this.value;
        this.lightColor.b = this.value;
        this.matLight?.setProperty('emissive', this.lightColor);
        
    }
}

