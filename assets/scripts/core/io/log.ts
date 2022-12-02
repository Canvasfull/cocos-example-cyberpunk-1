export class Log {

    static Init() {}

    static info(data: any): void {
        console.info(data);
    }

    static debug(data: any): void {
        console.log(data);
    }

    static error(data: any): void {
        console.error(data);
    }

    static warn(data: any): void {
        console.warn(data);
    }
    
}