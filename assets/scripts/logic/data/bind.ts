import { Node } from "cc";
import { LocalLabel } from "../../core/local/local-label";
import { Msg } from "../../core/msg/msg";
import { Singleton } from "../../core/pattern/singleton";
import { BtnBase, FilBase, GrpBag, GrpBase, GrpEquipInfo, 
    GrpGM, GrpPickedTips, GrpSelectEquips, SliBase, 
    TglBase, TxtBase, UICom } from "../../core/ui/ui-base";
import { UtilNode } from "../../core/util/util";

export class Bind extends Singleton {

    _map: { [name: string]: Function } = {}

    _eventCount = 0;

    public init (): void {

        BindUI.init();

        // Bind text value.
        Msg.on('update_data', this.doEvent.bind(this));

        // Bind button.
        this._map['btn_select_upgrade_0'] = ()=> {
            Msg.emit('back');
        }

        this._map['btn_select_upgrade_1'] = ()=> {
            Msg.emit('back'); 
        }

        this._map['btn_select_upgrade_2'] = ()=> {
            Msg.emit('back'); 
        }


    }

    public initData (data: [{ name: string, event: string, data: string }]) {
        data.forEach(events => {
            let n = events.name;
            let e = events.event;
            let d = events.data;
            if (!events.data) d = null;
            //console.log(n, e, d);
            this._map[n] = () => {
                console.log(n, e, d);
                Msg.emit(e, d);
            }
        });
    }

    public on (key: string) {
        console.log(key);
        var event = this._map[key];
        if (event) {
            event();
            this.doEvent();
        } else {
            console.log('Can not find key:' + key);
        }
    }

    public get (key: string) {
        return this._map[key]();
    }

    public hasBind (key: string): boolean {
        return this._map[key] != null;
    }

    public doEvent () {
        this._eventCount++;
    }

    public checkRefresh () {
        if (this._eventCount > 0) {
            Msg.emit("refresh_ui");
            this._eventCount = 0;
        }
    }

    public update (deltaTime: number): void {
        this.checkRefresh();
    }

}

export class BindUI {

    private static _map: { [com: string]: (node: Node) => UICom } = {};

    public static init () {

        this._map['btn'] = (node: Node) => {
            return new BtnBase(node);
        }

        this._map['txt'] = (node: Node) => {
            return new TxtBase(node);
        }

        this._map['grp'] = (node: Node) => {
            return new GrpBase(node);
        }

        this._map['tgl'] = (node: Node) => {
            return new TglBase(node);
        }

        this._map['grp_gm'] = (node: Node) => {
            return new GrpGM(node);
        }

        this._map['sli'] = (node: Node) => {
            return new SliBase(node);
        }

        this._map['fil'] = (node: Node) => {
            return new FilBase(node);
        }

        this._map['grp_picked_tips'] = (node:Node) => {
            return new GrpPickedTips(node);
        }

        this._map['grp_select_equips'] = (node:Node) => {
            return new GrpSelectEquips(node);
        }

        this._map['grp_equip_info'] = (node:Node) => {
            return new GrpEquipInfo(node);
        }

        this._map['grp_bag'] = (node:Node) => {
            return new GrpBag(node);
        }
    }

    public static get (node: Node): UICom[] {

        var children = UtilNode.getChildren(node);
        var coms: UICom[] = [];

        //console.log('-------- children:', children);
        for (var i = 0; i < children.length; i++) {
            const tempi = children[i];

            // Bind local key.
            if (tempi.name.includes('local_')) {
                tempi.addComponent(LocalLabel);
            }

            if (this._map[tempi.name]) {
                // Bind key
                const key = tempi.name;
                const com = this._map[key];
                if (com) {
                    coms.push(this._map[key](tempi));
                    continue;
                }
            }
            if (Bind.Instance.hasBind(tempi.name)) {
                // Bind type
                const type = tempi.name.slice(0, 3);
                const comtype = this._map[type];
                if (comtype) {
                    coms.push(comtype(tempi));
                }
            }
        }

        return coms;
    }

}