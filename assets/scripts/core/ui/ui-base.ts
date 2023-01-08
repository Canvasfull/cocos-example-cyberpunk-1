
import { _decorator, UITransform, Node, Button, Toggle, EditBox,
    Label, Sprite, Slider, math, SpriteComponent, SpriteFrame, v3, v2, Vec2, } from 'cc';
import { GM } from '../../gm/gm';
import { BagItems } from '../../logic/actor/actor-bag';
import { Bind, BindUI } from '../../logic/data/bind';
import { Level } from '../../logic/level/level';
import { Sound } from '../audio/sound';
import { Game } from '../../logic/data/game';
import { Local } from '../localization/local';
import { Msg } from '../msg/msg';
import { Res } from '../res/res';
import { ResCache } from '../res/res-cache';
import { Queue } from '../util/data-structure';
import { GMath } from '../util/g-math';
import { UtilNode, UtilVec3 } from '../util/util';
import { FilSmooth } from './fil-smooth';

export class UIBase {

    public node: Node;

    public isOn = false;

    public _map: UICom[] = Object.create(null);

    constructor (node: Node) {
        this.node = node;
        this._map = BindUI.get(this.node);
    }

    public refresh (): void {
        if (!this.isOn) return;
        for (var i = 0; i < this._map.length; i++)
            this._map[i].refresh();
    }

    public on (): void {
        this.isOn = true;
        for (var i = 0; i < this._map.length; i++)
            this._map[i].on();
        this.node.active = true;
    }

    public off (): void {
        this.isOn = false;
        for (var i = 0; i < this._map.length; i++)
            this._map[i].off();
        this.node.active = false;
    }

    public destroy (): void { }
}

export class UICom {

    protected _node: Node;

    constructor (node: Node) {
        this._node = node;
    }

    public on (): void { }

    public off (): void { }

    public refresh (): void { }

}

export class BtnBase extends UICom {
    private _name: string = '';
    private _btn: Button | null | undefined;
    constructor (node: Node) {
        super(node);
        let self = this;
        this._name = node.name;
        this._btn = self._node?.getComponent(Button);
        this._node?.on(Button.EventType.CLICK, () => {
            Bind.Instance.on(self._name);
            Sound.on('sfx_click');
        }, this);
    }
}

export class TxtBase extends UICom {
    text: Label;
    constructor (node: Node) {
        super(node);
        this.text = UtilNode.getComponent(this._node, Label);
        this.text.string = Bind.Instance.get(this._node?.name);
    }

    public on (): void {
        super.on();
        this.refresh();
    }

    public refresh (): void {
        super.refresh();
        this.text!.string = Bind.Instance.get(this._node!.name);
    }
}

export class SliBase extends UICom {
    slider: Slider;
    fill: Sprite;
    constructor (node: Node) {
        super(node);
        this.slider = UtilNode.getComponent(this._node, Slider);
        this.fill = UtilNode.getChildComponent(this._node, 'fill', Sprite);
        if(this.fill.type !== Sprite.Type.FILLED) throw new Error(`${this._node.name} node Sprite not set Sprite.Type.FILLED`);
        var defaultValue = Bind.Instance.get(this._node.name);
        this.slider.progress = defaultValue;
        this.fill!.fillRange = defaultValue;
        this.slider?.node.on('slide', () => {
            this.fill!.fillRange = GMath.range(1, 0, this.slider!.progress);
            Msg.emit(this._node.name, this.slider?.progress);
        }, this);
    }

    public on(): void {
        super.on();
        var defaultValue = Bind.Instance.get(this._node.name);
        this.slider!.progress = defaultValue;
        this.fill!.fillRange = defaultValue;
    }
}

export class FilBase extends UICom {
    fil_value: Sprite;
    fil_smooth: FilSmooth;
    constructor (node: Node) {
        super(node);
        this.fil_value = UtilNode.getComponent(this._node, Sprite);
        this.fil_value.fillRange = 0;
        this.fil_smooth = this._node.addComponent(FilSmooth);
        Msg.on(this._node.name, (value: number) => {
            this.fil_smooth.setValue(value);
        });
    }

    public on(): void {
        this.fil_value!.fillRange = 0;
    }
}

export class SprBase extends UICom {
    sprite: Sprite;
    constructor (node: Node) {
        super(node);
        this.sprite = UtilNode.getComponent(this._node, Sprite);
        Msg.on(this._node.name, (value: SpriteFrame) => {
            this.sprite!.spriteFrame = value;
        })
    }

    public on(): void {
        super.on();
        const src = Bind.Instance.get(this._node.name);
        this.sprite.spriteFrame = src;
    }
}

export class GrpBase extends UICom {
    constructor (node: Node) {
        super(node);
    }
}

export class GrpGM extends GrpBase {
    btn_gm: Node;
    inp_gm: EditBox;
    constructor (node: Node) {
        super(node);
        this.btn_gm = UtilNode.getChildByName(this._node, 'btn_gm');
        this.inp_gm = UtilNode.getChildComponent(this._node, 'inp_gm', EditBox);
        this.btn_gm!.on(Button.EventType.CLICK, () => {
            GM.run(this.inp_gm!.string);
        })
    }
}

export class TglBase extends UICom {
    private _toggle: Toggle;
    constructor (node: Node) {
        super(node);
        this._toggle = UtilNode.getComponent(this._node, Toggle);
        this._node.on(Toggle.EventType.TOGGLE, () => {
            
            Bind.Instance.on(this._node.name);
        })
    }
}

export class GrpSelectEquips extends UICom {

    list:Array<GrpSelectItem>;
    img_select_highlight:Node;
    _curIndex = -1;

    constructor (node: Node) {
        super(node);
        //Init circle items.
        const count = Game.Instance._data.count_bag_count;
        this.list = new Array<GrpSelectItem>(count);
        const angle = 360 / count;
        this.img_select_highlight = UtilNode.getChildByName(this._node, 'img_select_highlight');
        this.img_select_highlight.setPosition(100000, 0, 0);
        const item = UtilNode.getChildByName(this._node, 'img_items');
        const radius = item.position.x;
        const offset = angle / 2;
        const V2FORWARD = v2(1, 0);

        const getPosFromAngle = (angle: number)=>{
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius; 
            return { x: x, y: y};
        }

        for(let i = 0; i < count; i++) {
            const currentAngle = angle * i + offset;
            const iAngle = math.toRadian(currentAngle);
            const pos = getPosFromAngle(iAngle);
            const newItem = Res.instNode(item, this._node, v3(pos.x, pos.y, 0));
            this.list[i] = new GrpSelectItem(newItem, currentAngle - 90);
        }

        item.active = false;

        Msg.on('msg_select_equip', (dir:Vec2)=> {

            if (dir.length() <= Game.Instance._data.sensitivity_select_weapon) return;
            
            let curAngle = math.toDegree(Vec2.angle(dir, V2FORWARD));
            const projOrigin = v2(0, 1);
            const dot = Vec2.dot(projOrigin, dir);
            if (dot < 0) curAngle = 360 - curAngle;
            this._curIndex = Math.round(curAngle / angle);

            if (this._curIndex >= Game.Instance._data.count_bag_count) {
                //console.error(` Calculate equip error current index: ${this._curIndex}, current Angle: ${curAngle}, dir: ${dir}`);
                this._curIndex = Game.Instance._data.count_bag_count - 1;
            }

            const selectAngle = math.toRadian(this._curIndex * angle + offset)
            const pos = getPosFromAngle(selectAngle);
            this.img_select_highlight!.setPosition(pos.x, pos.y, 0);
            this.img_select_highlight.setRotationFromEuler(0, 0, this.list[this._curIndex]._angle);

        })
    }

    public on(): void {
        const _player = Level.Instance._actor; 
        // set equip info.
        const data = _player._data.items;
        const itemsName = _player._data.items_index;
        for(let i = 0; i < this.list.length; i++) {
            const itemName = itemsName[i];
            const itemObj = this.list[i];
            const hasItem = itemName.length > 0;
            itemObj.setDisplay(hasItem);
            if (hasItem) {
                const item = data[itemName];
                itemObj.setInfo(item);
            } 
        } 
    }

    public off(): void {
        // off ui panel then.
        Level.Instance._actor.onEquip(this._curIndex);
    }

}

class GrpSelectItem {
    txt_nun:Label;
    img_icon:Sprite;
    _node:Node;
    _angle:number;
    constructor(node: Node, angle:number) {
        this._angle = angle;
        this._node = node;
        const img_bg = UtilNode.getChildByName(this._node, 'img_bg');
        img_bg.setRotationFromEuler(0, 0, angle);
        console.log(`item angle : ${angle}`);
        this.txt_nun = UtilNode.getChildComponent(this._node, 'txt_num', Label);
        this.img_icon = UtilNode.getChildComponent(this._node, 'img_icon', Sprite);
    }

    setDisplay(isShow:boolean) {
        this.txt_nun!.node.active = isShow;
        this.img_icon!.node.active = isShow;
    }

    setInfo(item:BagItems) {
        this.txt_nun!.string = item.count.toString();
        this.img_icon!.spriteFrame = ResCache.Instance.getSprite(`img_icon_${item.name}`);
    }
}

export class GrpEquipInfo extends UICom {

    txt_equip_info:Label | undefined | null;

    constructor (node:Node) {
        super(node);
        this.txt_equip_info = UtilNode.getChildComponent(this._node, 'txt_equip_info', Label);
        Msg.on('msg_update_equip_info',()=>{
            const _player = Level.Instance._actor;
            const items = _player._data.items;
            const items_index = _player._data.items_index;
            const cur_equip_bag_index = _player._data.cur_equip_bag_index;
            const hasHighLight = cur_equip_bag_index !== -1;
            if (hasHighLight) {
                // Get current data.
                const itemName = items_index[cur_equip_bag_index];
                const itemData = items[itemName];
                if (itemName !== '') {
                    const isShow = itemData.data.bullet_count > 1;
                    Msg.emit('msg_grp_equip_info', isShow ? 255 : 0);
                    if (isShow) {
                        this.txt_equip_info!.string = `${Local.Instance.get('reload')}\n(${itemData.bulletCount})`;
                    }
                }
            }
        })
    }
}

export class GrpBag extends UICom {
    list:Array<GrpBagItem>;
    img_highlight:Node;
    constructor (node:Node) {
        super(node);
        this.img_highlight = UtilNode.getChildByName(this._node, 'img_highlight');
        if (this.img_highlight == undefined && this.img_highlight === null) throw new Error(`${this._node.name}`)
        const count = Game.Instance._data.count_bag_count;
        this.list = new Array<GrpBagItem>(count);
        const itemRoot = UtilNode.getChildByName(this._node, 'items_root');
        this.img_highlight.active = false;
        for(let i = 0; i < itemRoot.children.length; i++) {
            this.list[i] = new GrpBagItem(itemRoot.children[i], i + 1);
        }
        Msg.on('msg_update_bag', ()=>{
            const _player = Level.Instance._actor;
            // set equip info.
            const data = _player._data.items;
            const itemsName = _player._data.items_index;
            for(let i = 0; i < this.list.length; i++) {
                const itemName = itemsName[i];
                const itemObj = this.list[i];
                const hasItem = itemName.length > 0;
                itemObj.setDisplay(hasItem);
                if (hasItem) {
                    const item = data[itemName];
                    itemObj.setInfo(item);
                } 
            }
            Msg.emit('msg_grp_bag', 255);
        })

        Msg.on('msg_change_equip', ()=> {
            const _player = Level.Instance._actor;
            const cur_equip_bag_index = _player._data.cur_equip_bag_index;
            const hasHighLight = cur_equip_bag_index !== -1;
            this.img_highlight.active = hasHighLight;
            if (hasHighLight) {
                const highPos = this.list[cur_equip_bag_index]._node.position
                this.img_highlight.setPosition(highPos.x, highPos.y, highPos.z);
            }
            Msg.emit('msg_grp_bag', 255);
        })

    }
}

class GrpBagItem {
    txt_nun:Label;
    img_icon:Sprite;
    _node:Node;
    index:number;
    constructor(node:Node, index:number) {
        this._node = node;
        this.index = index;
        this.txt_nun = UtilNode.getChildComponent(this._node, 'txt_num', Label);
        this.txt_nun.string = `${this.index}`;
        this.img_icon = UtilNode.getChildComponent(this._node, 'img_icon', Sprite);
        this.setDisplay(false);
    }

    setDisplay(isShow:boolean) {
        this.img_icon.node.active = isShow;
    }

    setInfo(item:BagItems) {
        this.img_icon.spriteFrame = ResCache.Instance.getSprite(`img_icon_${item.name}`);
    }
}

export class GrpPickedTips extends UICom {

    list:Array<GrpPickedTipsItem>;
    msgs:Queue<MsgPicked>;

    index = 0;

    constructor (node:Node) {
        super(node);
        // Init deep default 10.
        const count = Game.Instance._data.count_picked_info;
        this.list = new Array<GrpPickedTipsItem>(count);
        this.msgs = new Queue(count);
        const item = this._node.children[0];

        for(let i = 0; i < count; i++) {
            const newItem = Res.instNode(item, this._node);
            this.list[i] = new GrpPickedTipsItem(newItem);
        }

        item.active = false;
        Msg.on('msg_tips', (msg:string)=>{
            this._node.children[0].setSiblingIndex(count);
            this.list[this.index].refresh(msg);
            this.index++;
            if (this.index >= count) this.index = 0;
        })
    }

}

export class GrpMap extends UICom {

    list:Array<Node>;

    map:Node;

    constructor (node: Node) {
        super(node);

        this.map = UtilNode.find(this._node, 'map');
        const img_enemy_point = UtilNode.find(this._node, 'img_enemy_point');
        const count = 20;
        this.list = new Array(count);
        this.list[0] = img_enemy_point;

        for(let i = 1; i < count; i++) {
            let newPoint = Res.instNode(img_enemy_point, img_enemy_point.parent!, v3(10000, 0, 0));
            this.list[i] = newPoint;
        }

        let position = v3(0, 0, 0);

        const map_width = 1158;
        const map_height = 1172;

        const world_map_width = 110;
        const world_map_height = 110;

        const offset_x = 61.846;
        const offset_y = 95.363;

        const scale_x = map_width / world_map_width;
        const scale_y = map_height / world_map_height;

        Msg.on('msg_update_map', ()=>{

            UtilVec3.copy(position, Level.Instance._actor.node.position);
            const y = position.x * scale_x;
            const x = position.z * scale_y;
            position.z = 0;
            position.x = -x;
            position.y = -y;
            
            this.map.setPosition(position);

            const enemies = Level.Instance._enemies;
            const enemyCount = enemies.length;
            for(let i = 0; i < count; i++) {
                const hasEnemy = i < enemyCount
                const currentNode = this.list[i];
                if(!hasEnemy) {
                    currentNode.setPosition(10000, 0, 0);
                    continue;
                }
                UtilVec3.copy(position, enemies[i].position);
                const y = position.x * scale_x;
                const x = position.z * scale_y;
                position.z = 0;
                position.x = x;
                position.y = y;
                this.list[i].setPosition(position.x, position.y, position.z);
            }

        });
    }

}

interface MsgPicked {
    name:string,
    num:number,
    time:number,
}

class GrpPickedTipsItem {

    txt_info:Label;
    _node:Node;

    constructor(node:Node) {
        this._node = node;
        this.txt_info = UtilNode.getChildComponent(this._node, 'txt_info', Label);
    }

    refresh(msg:string) {
        this.txt_info.string = msg;
        this.setDisplay(true);
    }

    setDisplay(isShow:boolean) {
        this._node.active = isShow;
    }
    
}