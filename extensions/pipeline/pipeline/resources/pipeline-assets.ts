import { _decorator, Component, Node, Material, path } from 'cc';
import { EDITOR } from 'cc/env';
import { loadGraph } from '../graph/graph';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('PipelineAssets')
@executeInEditMode
export class PipelineAssets extends Component {
    static instance: PipelineAssets

    @property(Material)
    _materials: Material[] = []
    @property(Material)
    get materials () {
        return this._materials
    }
    set materials (ms) {
        this._materials = ms
        this.updateMaterials();
    }

    materialNames: string[] = []
    materialMap: Map<string, Material> = new Map

    getMaterial (name: string) {
        return this.materialMap.get(name)
    }

    updateMaterials () {
        this.materialMap.clear()
        this.materialNames = this.materials.map(m => {
            if (!m) {
                return;
            }
            let name = path.basename(m.effectName)
            this.materialMap.set(name, m)
            return name
        });

        this.materials.map(m => {
        })
    }

    onEnable () {
        PipelineAssets.instance = this
        this.updateMaterials();
        loadGraph()
    }
    onDisable () {
        if (PipelineAssets.instance === this) {
            PipelineAssets.instance = undefined
        }
    }
}


