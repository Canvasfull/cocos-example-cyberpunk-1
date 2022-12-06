
import { _decorator, Component, Node, find, v3 } from 'cc';
import { u3 } from '../../core/util/util';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = weather
 * DateTime = Fri Mar 04 2022 15:21:19 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = weather.ts
 * FileBasenameNoExtension = weather
 * URL = db://assets/scripts/logic/weather/weather.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */

@ccclass('Weather')
export class Weather extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;

    _flowTarget: Node;
    _pos = v3(0, 0, 0);

    start() {
        // [3]
        this._flowTarget = find('camera_controller');
    }

    update(deltaTime: number) {
        //     // [4]
        u3.c(this._pos, this._flowTarget.worldPosition);
        this.node.setPosition(this._pos);
    }
}

/*
@ccclass('Cloudy')
export class Cloudy extends Component {

}

@ccclass('Cloud')
export class Cloud extends Component {

}

@ccclass('Rainy')
export class Rainy extends Component {

}

@ccclass('Windy')
export class Windy extends Component {

}
*/