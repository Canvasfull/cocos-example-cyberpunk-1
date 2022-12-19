import { Component, _decorator } from "cc";

const { ccclass, property, executeInEditMode } = _decorator

@ccclass('BloomSetting')
@executeInEditMode
export class BloomSetting extends Component {
    static instance: BloomSetting | undefined

    @property
    enable = true

    @property
    threshold = 1

    @property
    iterations = 2

    @property
    intensity = 0.8

    @property
    blurRadius = 1

    onEnable () {
        BloomSetting.instance = this
    }

    onDisable () {
        if (BloomSetting.instance === this) {
            BloomSetting.instance = undefined;
        }
    }
}
