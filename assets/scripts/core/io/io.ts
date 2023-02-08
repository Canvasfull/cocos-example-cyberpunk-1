import { sys, native } from "cc";

export class IO {
    
    public static getNum (name: string): number {
        var val = this.read(name);
        if (val.search('.') === -1) {
            var num = Number.parseInt(val);
        } else {
            var num = Number.parseFloat(val);
        }
        if (!num) {
            num = 0;
        }
        return num;
    }

    public static write (path: string, data: string): void {
        try { 
            console.log('is native:', sys.isNative);
            if (sys.isNative) {
                native.fileUtils.writeStringToFile(data, path);
            }else{
                sys.localStorage.setItem(path, data);
                console.log('set item end:');
            }
        } catch (error) {
            console.error('can not write:', error);
        }

    }

    public static read (path: string): string {
        try {
            if (sys.isNative) {
                return native.fileUtils.getStringFromFile(path);
            }else{
                return sys.localStorage.getItem(path);
            }
            
        }
        catch (err) {
            console.error(err);
            return ''
        }
    }

    public static delete (name: string) {
        sys.localStorage.removeItem(name);
    }

    public static exist (path: string): boolean {
        let item = sys.localStorage.getItem(path)
        return item && item.length > 0;
    }

}
