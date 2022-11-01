import { Game, game, sys } from 'cc';
import { EDITOR } from 'cc/env';
import { HrefSetting } from '../settings/href-setting';
import { loadGraph, showGraph } from './graph';

// if (!EDITOR) {
//     game.on(Game.EVENT_GAME_INITED, () => {
//         loadGraph();
//     })
// }

// 运行时环境中添加按钮来切换图的显示
if (!EDITOR && sys.isBrowser) {
    game.on(Game.EVENT_GAME_INITED, () => {
        if (HrefSetting.graph) {
            let showing = false;
            let btn = document.createElement('button');
            btn.innerHTML = 'show';

            btn.onclick = function () {
                showing = !showing;
                btn.innerHTML = showing ? 'hide' : 'show';
                showGraph(showing);
            };

            (btn as any).style = `
                position:absolute;
                top: 0px;
                right: 0px;
                z-index: 999;
            `;
            document.body.appendChild(btn);
        }
    })
}
