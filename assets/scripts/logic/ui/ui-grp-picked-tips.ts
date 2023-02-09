// import { _decorator, Node, Label, game } from 'cc';
// import { Game } from '../../core/data/game';
// import { Local } from '../../core/local/local';
// import { Msg } from '../../core/msg/msg';
// import { Res } from '../../core/res/res';
// import { UICom } from '../../core/ui/ui-base';
// import { Queue } from '../../core/util/data-structure';

// export class GrpPickedTips extends UICom {

//     list:Array<GrpPickedTipsItem>;
//     msgs:Queue<MsgPicked>;

//     index = 0;

//     constructor (node:Node) {
//         super(node);
//         // Init deep default 10.
//         const count = DataGameInst._data.count_picked_info;

//         this.list = new Array<GrpPickedTipsItem>(count);

//         this.msgs = new Queue(count);

//         const item = this._node.children[0];

//         this.list[0] = new GrpPickedTipsItem(item);

//         for(let i = 1; i < count; i++) {
//             const newItem = Res.instNode(item, this._node);
//             this.list[i] = new GrpPickedTipsItem(newItem);
//             this.list[i].setDisplay(false);
//         }
        
//         Msg.on('msg_picked', (info:MsgPicked)=>{
//             this._node.children[0].setSiblingIndex(count);
//             this.list[this.index].refresh(info);
//         })
//     }

// }

// interface MsgPicked {
//     name:string,
//     num:number,
//     time:number,
// }

// class GrpPickedTipsItem {

//     txt_info:Label;
//     _node:Node;

//     constructor(node:Node) {
//         this._node = node;
//     }

//     refresh(info:MsgPicked) {
//         this.txt_info.string = `${Local.Instance.get('picked')}  ${info.name}  x${info.num}`;
//         this.setDisplay(true);
//     }

//     setDisplay(isShow:boolean) {
//         this._node.emit('setDisplay', isShow ? 255 : 0);
//     }
    
// }