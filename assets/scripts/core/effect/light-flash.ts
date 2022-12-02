
import { _decorator, Component, Node, SphereLight} from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = light_flash
 * DateTime = Wed Jan 12 2022 18:59:08 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = light-flash.ts
 * FileBasenameNoExtension = light-flash
 * URL = db://assets/scripts/core/effect/light-flash.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('light_flash')
export class light_flash extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    
    _light: SphereLight = null;
    _curLuminance: number = 0;
    _range: number = 0;
    _time: number = 0;

    @property
    min: number = 1;

    @property
    range: number = 0.5;

    @property
    speed: number = 10;

    

    start () {
        // [3]
        this._light = this.getComponent(SphereLight);
        this._curLuminance = this.min;
    }

    update (deltaTime: number) {
         // [4]
         /*
         this._curLuminance = this._curLuminance + deltaTime * this.speed;
         if(this._curLuminance > this.max || this._curLuminance < this.min) {
             this.speed *= -1;
         }
         this._light.luminance = this._curLuminance;
         */
         this._time = this._time + deltaTime * this.speed;
         this._range = Math.sin(this._time) * this.range + this.min;
         this._light.range = this._range;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
