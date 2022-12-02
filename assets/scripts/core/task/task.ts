import { Singleton } from "../pattern/singleton";

type Task<T> = {
    name?: string;
    fun: ()=>Promise<T>;
}

export class TaskRuner {

    private _queue: Task<any>[] = [];
    private _active: number = 0;

}
