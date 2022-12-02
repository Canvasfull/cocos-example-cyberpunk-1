
export class Singleton {

    private static _instance: any = null;

    public static get Instance() {
        if(!this._instance) {
            this._instance = new this();
            //console.log('Instance new.', this._instance);
        }
        return this._instance;
    }

    public init() {}

    public clear() {
        Singleton._instance = null;
    }

}