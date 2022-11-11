import { Component, MeshRenderer, ReflectionProbeType, _decorator } from "cc";

const { ccclass, executeInEditMode, property } = _decorator;

@ccclass('SwitchProbe')
@executeInEditMode
export class SwitchProbe extends Component {
    @property
    _useProbe = true;
    @property
    get useProbe () {
        return this._useProbe;
    }
    set useProbe (v) {
        this._useProbe = v;

        let children = this.node.children;
        for (let i = 0; i < children.length; i++) {
            children[i].getComponents
        }

        let mrs = this.node.getComponentsInChildren(MeshRenderer);
        mrs.forEach(mr => {
            if (v) {
                mr.reflectionProbe = ReflectionProbeType.BAKED_CUBEMAP;
            }
            else {
                mr.reflectionProbe = ReflectionProbeType.NONE;
            }
        })
    }

}
