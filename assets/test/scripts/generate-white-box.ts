import { _decorator, Component, Node, MeshRenderer, instantiate, CCObject, Prefab, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('generate_white_box')
export class generate_white_box extends Component {
    @property(Node)
    targetRoot: Node | undefined

    @property(Node)
    temp: Node | undefined

    @property
    get generate () {
        return false
    }
    set generate (v) {
        this.doGenerate()
    }


    doGenerate () {
        if (!this.temp || !this.targetRoot) {
            return;
        }

        let root = find('root', this.node)
        if (!root) {
            root = new Node('root')
            root.parent = this.node
        }
        root.removeAllChildren();

        let mrs = this.targetRoot.getComponentsInChildren(MeshRenderer);
        mrs.forEach(mr => {
            if (!mr.model) {
                return;
            }

            let n = instantiate(this.temp)! as any as Node;
            n.name = mr.node.name

            let bounds = mr.model!.worldBounds
            n.position = bounds.center;
            n.setScale(bounds.halfExtents.x * 2, bounds.halfExtents.y * 2, bounds.halfExtents.z * 2)

            // n.hideFlags |= CCObject.Flags.DontSave;
            n.parent = root;
        })
    }


}


