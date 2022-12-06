
import { _decorator, UITransform, Node, Button, Toggle, EditBox,
    Label, Sprite, Slider, math, SpriteComponent, SpriteFrame, v3, v2, Vec2, } from 'cc';
import { GM } from '../../gm/gm';
import { BagItems } from '../../logic/actor/actor-bag';
import { Bind, BindUI } from '../../logic/data/bind';
import { Level } from '../../logic/level/level';
import { Sound } from '../audio/sound';
import { Game } from '../data/game';
import { Local } from '../local/local';
import { Msg } from '../msg/msg';
import { Res } from '../res/res';
import { ResCache } from '../res/res-cache';
import { Queue } from '../util/data-structure';
import { FilSmooth } from './fil-smooth';

export class UIBase {

    public uiTran: UITransform;

    public node: Node;

    public isOn = false;

    public _map: UICom[] = Object.create(null);

    constructor (node: Node) {
        this.node = node;
        this.uiTran = this.node.getComponent(UITransform);
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

    protected _node: Node = null;

    constructor (node: Node) {
        this._node = node;
    }

    public on (): void { }

    public off (): void { }

    public refresh (): void { }

}

export class BtnBase extends UICom {
    private _name: string = '';
    private _btn: Button = null;
    constructor (node: Node) {
        super(node);
        let self = this;
        this._name = node.name;
        this._btn = self._node.getComponent(Button);
        this._node.on(Button.EventType.CLICK, () => {
            Bind.Instance.on(self._name);
            Sound.on('sfx_click');
        }, this);
    }
}

export class TxtBase extends UICom {
    text: Label;
    constructor (node: Node) {
        super(node);
        this.text = this._node.getComponent(Label);
        this.text.string = Bind.Instance.get(this._node.name);
    }

    public on (): void {
        super.on();
        this.refresh();
    }

    public refresh (): void {
        super.refresh();
        this.text.string = Bind.Instance.get(this._node.name);
    }
}

export class SliBase extends UICom {
    slider: Slider;
    fill: SpriteComponent;
    constructor (node: Node) {
        super(node);
        this.slider = this._node.getComponent(Slider);
        this.fill = this._node.getChildByName('fill')?.getComponent(SpriteComponent);
        var defaultValue = Bind.Instance.get(this._node.name);
        this.slider.progress = defaultValue;
        this.fill.fillRange = defaultValue;
        this.slider?.node.on('slide', () => {
            this.fill.fillRange = this.slider?.progress;
            Msg.emit(this._node.name, this.slider?.progress);
        }, this);
    }

    public on(): void {
        super.on();
        var defaultValue = Bind.Instance.get(this._node.name);
        this.slider.progress = defaultValue;
        this.fill.fillRange = defaultValue;
    }
}

export class FilBase extends UICom {
    fil_value: Sprite;
    fil_smooth: FilSmooth = Object.create(null);
    constructor (node: Node) {
        super(node);
        this.fil_value = this._node.getComponent(Sprite);
        this.fil_value.fillRange = 0;
        this.fil_smooth = this._node.addComponent(FilSmooth);
        Msg.on(this._node.name, (value: number) => {
            this.fil_smooth.setValue(value);
        });
    }

    public on(): void {
        this.fil_value.fillRange = 0;
    }
}

export class SprBase extends UICom {
    spr: Sprite;
    constructor (node: Node) {
        super(node);
        this.spr = this._node.getComponent(Sprite);
        Msg.on(this._node.name, (value: SpriteFrame) => {
            this.spr.spriteFrame = value;
        })
    }
}

export class GrpBase extends UICom {
    constructor (node: Node) {
        super(node);
    }
}

export class GrpGM extends GrpBase {
    btn_gm: Node = Object.create(null);
    inp_gm: EditBox = Object.create(null);
    constructor (node: Node) {
        super(node);
        this.btn_gm = this._node.getChildByName('btn_gm');
        this.inp_gm = this._node.getChildByName('inp_gm').getComponent(EditBox);
        this.btn_gm.on(Button.EventType.CLICK, () => {
            
            GM.run(this.inp_gm.string);
        })
    }
}

export class TglBase extends UICom {
    private _toggle: Toggle = Object.create(null);
    constructor (node: Node) {
        super(node);
        this._toggle = this._node.getComponent(Toggle);
        this._node.on(Toggle.EventType.TOGGLE, () => {
            
            Bind.Instance.on(this._node.name);
        })
    }
}

export class GrpSelectEquips extends UICom {

    list:Array<GrpSelectItem>;
    _curIndex = -1;

    img_select_highlight:Node;

    constructor (node: Node) {
        super(node);
        //Init circle items.
        const count = Game.Instance._data.count_bag_count;
        this.list = new Array<GrpSelectItem>(count);
        const angle = 360 / count;

        this.img_select_highlight = this._node.getChildByName('img_select_highlight');
        this.img_select_highlight.setPosition(100000, 0, 0);
        const item = this._node.getChildByName('img_items');
        const radius = item.position.x;
        const offset = angle / 2;

        const V2FORWARD = v2(1, 0);

        const getPosFromAngle = (angle: number)=>{
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius; 
            return { x: x, y: y};
        }

        for(let i = 0; i < count; i++) {
            const iAngle = math.toRadian(angle * i + offset);
            const pos = getPosFromAngle(iAngle);
            const newItem = Res.instNode(item, this._node, v3(pos.x, pos.y, 0));
            this.list[i] = new GrpSelectItem(newItem);
        }

        item.active = false;

        Msg.on('msg_select_equip', (dir:Vec2)=> {

            if(dir.length() <= Game.Instance._data.sensitivity_select_weapon) return;
            let curAngle = math.toDegree(Vec2.angle(dir, V2FORWARD));
            const projOrigin = v2(0, 1);
            const dot = Vec2.dot(projOrigin, dir);
            if(dot < 0) curAngle = 360 - curAngle;
            this._curIndex = Math.round(curAngle / angle);

            if(this._curIndex >= Game.Instance._data.count_bag_count) {
                console.error(` Calculate equip error current index: ${this._curIndex}, current Angle: ${curAngle}, dir: ${dir}`);
                this._curIndex = -1;
                return;
            }

            const selectAngle = math.toRadian(this._curIndex * angle + offset)
            const pos = getPosFromAngle(selectAngle);
            this.img_select_highlight.setPosition(pos.x, pos.y, 0);

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
            if(hasItem) {
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
    constructor(node) {
        this._node = node;
        this.txt_nun = this._node.getChildByName('txt_num').getComponent(Label);
        this.img_icon = this._node.getChildByName('img_icon').getComponent(SpriteComponent);
    }

    setDisplay(isShow:boolean) {
        this.txt_nun.node.active = isShow;
        this.img_icon.node.active = isShow;
    }

    setInfo(item:BagItems) {
        this.txt_nun.string = item.count.toString();
        this.img_icon.spriteFrame = ResCache.Instance.getSprite(`img_icon_${item.name}`);
    }
}

export class GrpEquipInfo extends UICom {

    txt_equip_info:Label;

    constructor (node:Node) {
        super(node);
        this.txt_equip_info = this._node.getChildByName('txt_equip_info').getComponent(Label);
        Msg.on('msg_update_equip_info',()=>{
            const _player = Level.Instance._actor;
            const items = _player._data.items;
            const items_index = _player._data.items_index;
            const cur_equip_bag_index = _player._data.cur_equip_bag_index;
            const hasHighLight = cur_equip_bag_index !== -1;
            if(hasHighLight) {
                // Get current data.
                const itemName = items_index[cur_equip_bag_index];
                const itemData = items[itemName];
                if(itemName != '') {
                    const isShow = itemData.data.bullet_count > 1;
                    Msg.emit('msg_grp_equip_info', isShow ? 255 : 0);
                    if (isShow) {
                        this.txt_equip_info.string = `${Local.Instance.get('reload')}\n(${itemData.bulletCount})`;
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
        this.img_highlight = this._node.getChildByName('img_highlight');
        const count = Game.Instance._data.count_bag_count;
        this.list = new Array<GrpBagItem>(count);
        const itemRoot = this._node.getChildByName('itemsroot');
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
                if(hasItem) {
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
            if(hasHighLight) {
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
        this.txt_nun = this._node.getChildByName('txt_num').getComponent(Label);
        this.txt_nun.string = `${this.index}`;
        this.img_icon = this._node.getChildByName('img_icon').getComponent(SpriteComponent);
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
            if(this.index >= count) this.index = 0;
        })
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
        this.txt_info = this._node.getChildByName('txt_info').getComponent(Label);
    }

    refresh(msg:string) {
        this.txt_info.string = msg;//`${Local.Instance.get('picked')}  ${Local.Instance.get(info.name)}  x${info.num}`;
        this.setDisplay(true);
    }

    setDisplay(isShow:boolean) {
        this._node.active = isShow;
    }
    
}