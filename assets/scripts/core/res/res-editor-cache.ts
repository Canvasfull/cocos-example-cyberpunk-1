import { _decorator, Component, Node, JsonAsset, Prefab } from 'cc';
import { ResCache } from './res-cache';
const { ccclass, property } = _decorator;

@ccclass('res_editor_cache')
export class res_editor_cache extends Component {

    @property(JsonAsset)
    jsons: JsonAsset[] | null = [];

    @property(Prefab)
    prefabs: Prefab[] = [];

    init() {
        ResCache.Instance.setJson(this.jsons);
        ResCache.Instance.setPrefab(this.prefabs);
    }

}

