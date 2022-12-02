
import { _decorator, Component, Material, Node, effects, EffectAsset } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = render_tool
 * DateTime = Thu Jan 13 2022 10:02:17 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = render-tool.ts
 * FileBasenameNoExtension = render-tool
 * URL = db://assets/scripts/core/util/render-tool.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('RendeTool')
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
