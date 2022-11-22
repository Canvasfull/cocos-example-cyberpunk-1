import { Component, ReflectionProbe, _decorator } from "cc";

const { ccclass, property, executeInEditMode } = _decorator

export let ReflectionProbes = {
    probes: [] as ReflectionProbe[]
}

@ccclass('ReflectionProbeUtils')
@executeInEditMode
export class ReflectionProbeUtils extends Component {
    probe: ReflectionProbe | undefined
    onEnable () {
        this.probe = this.getComponent(ReflectionProbe)
        if (ReflectionProbes.probes.indexOf(this.probe) === -1) {
            ReflectionProbes.probes.push(this.probe);
        }
    }
    onDisable () {
        let index = ReflectionProbes.probes.indexOf(this.probe)
        if (index !== -1) {
            ReflectionProbes.probes.splice(index, 1);
        }
    }
}
