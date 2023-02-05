import { Node } from "cc";
import { LocalLabel } from "../../core/localization/local-label";
import { Msg } from "../../core/msg/msg";
import { Singleton } from "../../core/pattern/singleton";
import { BtnBase, FilBase, GrpBag, GrpBase, GrpEquipInfo, 
    GrpGM, GrpMap, GrpPickedTips, GrpSelectEquips, SliBase, 
    SprBase, 
    TglBase, TxtBase, UICom } from "../../core/ui/ui-base";
import { UtilNode } from "../../core/util/util";
import { Local } from "../../core/localization/local";
import { GameQuality } from "./GameQuality";
import { Sound } from "../../core/audio/sound";
import { ResCache } from "../../core/res/res-cache";
import { Level } from "../level/level";

export class Bind extends Singleton {

    // Event dictionary, used to construct the mapping of keys to events.
    _map: { [name: string]: Function } = {}

    // Total number of events.
    totalEvents = 0;

    public init (): void {

        // Initialize the UI binding.
        BindUI.init();

        // Registered events are used to count the total number of events.
        Msg.on('msg_count_events', this.countEvents.bind(this));

        // Bind the button event of skill upgrade tab 0.
        this._map['btn_select_upgrade_0'] = ()=> {
            Msg.emit('back');
        }

        // Bind the button event of skill upgrade tab 1.
        this._map['btn_select_upgrade_1'] = ()=> {
            Msg.emit('back'); 
        }

        // Bind the button event of skill upgrade tab 2.
        this._map['btn_select_upgrade_2'] = ()=> {
            Msg.emit('back'); 
        }

        // Bind the current language name.
        this._map['txt_language'] = () => Local.Instance.getShowName();

        // Bind the current game quality name.
        this._map['txt_game_quality'] = () => GameQuality.Instance.getShowName();

        // Bind the current volume value.
        this._map['sli_sound'] = () => Sound.volumeSound;

        // Bind the current music volume value.
        this._map['sli_music'] = () => Sound.volumeMusic;

        // Bind game result score.
        this._map['spr_score'] = () => {
            const imgSrc= `txt_score_${Level.Instance.getLevelScore()}`;
            console.log(imgSrc);
            return ResCache.Instance.getSprite(imgSrc);
        }

    }

    public initData (data: [{ name: string, event: string, data: string | undefined }]) {

        this.init();

        data.forEach(events => {
            let name = events.name;
            let event = events.event;
            let data = events.data;
            if (!events.data) data = undefined;
            
            this._map[name] = () => {
                console.log(name, event, data);
                Msg.emit(event, data);
            }
        });
    }

    public on (key: string) {
        console.log(key);
        var event = this._map[key];
        if (event) {
            event();
            this.countEvents();
        } else {
            console.log('Can not find key:' + key);
        }
    }

    public get (key: string) {
        return this._map[key]();
    }

    public hasBind (key: string): boolean {
        return this._map[key] !== undefined;
    }

    public countEvents () {
        this.totalEvents++;
    }

    public checkRefresh () {
        if (this.totalEvents > 0) {
            Msg.emit("refresh_ui");
            this.totalEvents = 0;
        }
    }

    public update (deltaTime: number): void {
        this.checkRefresh();
    }

}

export class BindUI {

    private static _map: { [com: string]: (node: Node) => UICom } = {};

    public static init () {

        this._map['btn'] = (node: Node) => new BtnBase(node);

        this._map['txt'] = (node: Node) => new TxtBase(node);

        this._map['grp'] = (node: Node) => new GrpBase(node);

        this._map['spr'] = (node: Node) => new SprBase(node);

        this._map['tgl'] = (node: Node) => new TglBase(node);

        this._map['grp_gm'] = (node: Node) => new GrpGM(node);

        this._map['sli'] = (node: Node) => new SliBase(node);

        this._map['fil'] = (node: Node) => new FilBase(node);

        this._map['grp_picked_tips'] = (node:Node) => new GrpPickedTips(node);

        this._map['grp_select_equips'] = (node:Node) => new GrpSelectEquips(node);

        this._map['grp_equip_info'] = (node:Node) => new GrpEquipInfo(node);

        this._map['grp_bag'] = (node:Node) => new GrpBag(node);

        this._map['grp_map'] = (node:Node) => new GrpMap(node);

    }

    public static get (node: Node): UICom[] {

        var children = UtilNode.getChildren(node);
        var comList: UICom[] = [];

        
        for (let i = 0; i < children.length; i++) {
            const tempi = children[i];

            // Bind local key.
            if (tempi.name.includes('local_')) {
                tempi.addComponent(LocalLabel);
            }

            if (this._map[tempi.name]) {
                // Bind key
                const key = tempi.name;
                const com = this._map[key];
                if (com !== undefined) {
                    comList.push(this._map[key](tempi));
                    continue;
                }
            }
            if (Bind.Instance.hasBind(tempi.name)) {
                // Bind type
                const type = tempi.name.slice(0, 3);
                const comType = this._map[type];
                if (comType) {
                    comList.push(comType(tempi));
                }
            }
        }

        return comList;
    }

}