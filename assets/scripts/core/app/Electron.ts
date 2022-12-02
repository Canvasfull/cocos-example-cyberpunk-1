import { UI } from '../../core/ui/ui';

export default class Electron {

    static is_steam = false;

    static counter = 0;

    static get appUserID () {
        return globalThis.remote ? globalThis.remote.app.getUserID() : '';
    }

    static get appUserPath () {
        return globalThis.remote ? globalThis.remote.app.getPath('userData') : '';
    }

    static async sendAsyn (name: string, data: any = undefined, call: Function = undefined) {
        //console.log('sendAsyn', name, data);
        var call_data = await (window as any).electron?.ipcRenderer.invoke(name, data);
        if (call != undefined) {
            call(call_data);
            //console.log(call_data);
        }
    }

    static send (name: string, data: any = undefined) {
        //console.log('send', name, data);
        var call_data = (window as any).electron?.ipcRenderer.invoke(name, data);
        //console.log(call_data);
        return call_data;
    }

    static A2C (name: string, data: any): void {
        console.log('A2C:', name, data);
    }
}