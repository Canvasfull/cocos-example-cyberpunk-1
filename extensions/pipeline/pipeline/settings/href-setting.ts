import { EDITOR } from 'cc/env';

export const HrefSetting = {
    settings: 0,
    spector: 0,
    shadingScale: 1,
    graph: 0,
}


if (!EDITOR) {
    let href = window && window.location && window.location.href;
    let settings = href.split('?')[1]
    if (settings) {
        let results = settings.match(/([a-zA-Z]+=[0-9\.]+)/g)
        results.forEach(res => {
            let test = res.split('=')
            let value = Number.parseFloat(test[1])
            if (typeof value === 'number') {
                HrefSetting[test[0]] = value
            }
        })
    }

}

if (EDITOR) {
    HrefSetting.graph = 2;
}
