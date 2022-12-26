import { _decorator, Component, Node, ReflectionProbe, TextureCube, Material, MeshRenderer, renderer } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('test_reflect')
@executeInEditMode
export class test_reflect extends Component {
    @property(ReflectionProbe)
    _probe: ReflectionProbe | undefined;
    @property(ReflectionProbe)
    get probe () {
        return this._probe;
    }
    set probe (v) {
        this._probe = v;
        this.refresh();
    }

    @property(Material)
    _material: Material | undefined
    @property(Material)
    get material () {
        return this._material
    }
    set material (v) {
        this._material = v;
        this.refresh();
    }

    refresh () {
        if (!this.material || !this.probe) {
            return;
        }
        let mr = this.getComponent(MeshRenderer)

        let mat = new renderer.MaterialInstance({ parent: this.material })
        mat.setProperty('mainTexture', mr.bakeSettings._probeCubemap);

        mr.setMaterialInstance(mat, 0)
    }

    start () {
        this.refresh();
    }

    create () {
        // let probe = this.probe
        // probe._createProbe();

        // probe.probe.initBakedTextures()
        // probe.probe._renderObjects = [];
        // probe.probe._resetCameraParams();
        // probe.probe._attachCameraToScene();
        // probe.probe._needRender = true;

        // let textures = probe.probe.bakedCubeTextures;

        // let cube = new TextureCube()
        // cube.mipmaps = [{
        //     front: textures[0].,
        // }]
    }

    update (deltaTime: number) {

    }
}


