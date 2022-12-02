import { _decorator, Component, Node, Vec3, v3 } from 'cc';
import { Msg } from '../../core/msg/msg';
import { Res } from '../../core/res/res';
import { ResCache } from '../../core/res/res-cache';
const { ccclass, property } = _decorator;

@ccclass('DropItem')
export class DropItem extends Component {

    itemName:string;

    public init(name:string) {
        this.itemName = name;
        this.node.name = name;
        // Load Item.
        var prefab = ResCache.Instance.getPrefab(name + '_pickup');
        const dropNode = Res.inst(prefab, this.node, v3(0, 0, 0));

        this.node.on('picked', this.picked, this);
    }

    onDestroy() {
        this.node.off('picked', this.picked, this);
    }

    public picked() {

        // Remove object.
        this.node.destroy();

    }

}

