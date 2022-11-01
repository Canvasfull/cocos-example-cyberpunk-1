import { EDITOR } from 'cc/env';

let href = window && window.location && window.location.href;

export const HrefSetting = {
    settings: 1,//href && href.includes('settings=1'),
    spector: href && href.includes('spector=1'),
    graph: 0,
}

if (EDITOR) {
    HrefSetting.graph = 2;
}
else {
    let rets = (/graph *= *([0-9])/g).exec(href);
    if (rets && rets[1]) {
        HrefSetting.graph = Number.parseInt(rets[1]);
    }
}
