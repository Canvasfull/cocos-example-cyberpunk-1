
import { _decorator, Component, Node, find, ParticleAsset, ParticleSystem, Vec3, Vec2 } from 'cc';
import { World } from '../data/world';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = weather_cloud
 * DateTime = Tue Mar 08 2022 14:00:25 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = weather-cloud.ts
 * FileBasenameNoExtension = weather-cloud
 * URL = db://assets/scripts/logic/weather/weather-cloud.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('WeatherCloud')
export class WeatherCloud extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    particles:ParticleSystem[] = Object.create(null);
    _refresh_time = 1;

    x:number = 0;
    z:number = 0;

    start () {
        // [3]
        this.particles = this.node.getComponentsInChildren(ParticleSystem);
    }

    setActive(active:boolean) {
        this.node.active = active;
    }

    setStrength(value:number) {
        this.particles.forEach(element => {
            element.capacity = value;
        });
    }
    
    setDirection(x:number, z:number) {
        if (this.x === x && this.z === z) return;
        for(var i = 0; i < this.particles.length; i++) {
            var pi = this.particles[i];
            pi.renderer.useGPU = false;
            pi.velocityOvertimeModule.x.constant = x;
            pi.velocityOvertimeModule.z.constant = z;
            pi.renderer.useGPU = true;
        }

        this.x = x;
        this.z = z;
    }

    update (deltaTime: number) {
        this._refresh_time -= deltaTime;
        if (this._refresh_time <= 0) {
            var wind = World.Instance._data.wind;
            this.setDirection(wind.x,wind.z);
            this._refresh_time = 1;
        }
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
