import { path, sys } from "cc";


/**
 * Predefined variables
 * Name = io
 * DateTime = Tue Jan 11 2022 23:46:28 GMT+0800 (China Standard Time)
 * Author = canvas
 * FileBasename = io.ts
 * FileBasenameNoExtension = io
 * URL = db://assets/scripts/core/util/io.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
export class IO {
    
    public static getNum (name: string): number {
        var val = this.read(name);
        if (val.search('.') == -1) {
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
            if(sys.isNative) {
                jsb.fileUtils.writeStringToFile(data, path);
            }else{
                console.log('set item start', path, data);
                sys.localStorage.setItem(path, data);
                console.log('set item end:');
            }
        } catch (error) {
            console.error('can not write:', error);
        }

    }

    public static read (path: string): string {
        try {
            if(sys.isNative) {
                return jsb.fileUtils.getStringFromFile(path);
            }else{
                console.log('get items:', path);
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

    public static exsit (path: string): boolean {
        let item = sys.localStorage.getItem(path)
        return item && item.length > 0;
    }

}
