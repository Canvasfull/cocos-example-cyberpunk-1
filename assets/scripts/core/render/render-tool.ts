
import { _decorator, Component, Material, EffectAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RenderTool')
export class RenderTool extends Component {

    /**
     * Create material.
     */
    public static createMat(name: string): Material {
        const effect = EffectAsset.get(name);
        const mat = new Material();
        mat.initialize({effectName : name});
        return mat; 
    }

    /**
     * Change material
     */
    public static changeEffect(name: string, mat:Material) {
        const effect = EffectAsset.get(name)
        mat.initialize({effectName: name});
    }

}
