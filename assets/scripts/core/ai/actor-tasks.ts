import { game } from "cc";

export class TaskBase implements ITask {

    name: string = '';
    isStart: boolean = false;
    isWait: boolean = false;
    tasks:ITask[] = [];
    
    onCompleteFun:Function | undefined = undefined;

    add(...tasks:ITask[]) {
        for(let i = 0; i < tasks.length; i++) {
            this.tasks.push(tasks[i]);
        }
    }

    start() {
        this.isStart = true;
    }

    public sequence(task:ITask) {
        let sequence = new TaskSequence();
        sequence.add(task);
        this.tasks.push(sequence);
        return sequence;
    }

    public parallel(task:ITask) {
        let parallel = new TaskParallel();
        parallel.add(task);
        this.tasks.push(parallel);
        return parallel;
    }

    update() {
        if (!this.isStart) return;
        if (this.isWait) return;
        this.end();
    }

    end() {
        this.isStart = false
        this.isWait = false;
        if (this.onCompleteFun !== null) {
            this.onCompleteFun();
            console.log('on complete:', this);
        }
        this.onCompleteFun = undefined;

        console.log('on end:', this.name, game.frameTime);
    }

    break() {
        for(let i = 0; i < this.tasks.length; i++) {
            this.tasks[i].break();
        }
    }

    onComplete(call:Function) {
        this.onCompleteFun = call;
    }
}

export class TaskSequence extends TaskBase {

    index = 0;

    start(): void {
        super.start();
        this.index = 0;
        this.tasks[this.index].start();
    }

    update() {
        if (!this.isStart) return;
        if (this.isWait) return;
        if (!this.tasks[this.index].isStart) {
            this.next();
        }else{
            this.tasks[this.index].update();
        }
    }

    next() {
        this.index++;
        if (this.index >= this.tasks.length) {
            this.end();
        }else{
            this.tasks[this.index].start();
        }
    }

    end(){
        super.end();
    }

}

export class TaskParallel extends TaskBase {

    start(): void {
        super.start();
        for(let i = 0; i < this.tasks.length; i++) {
            this.tasks[i].start();
        }
    }

    update() {
        if (!this.isStart) return;
        if (this.isWait) return;
        
        for(let i = 0; i < this.tasks.length; i++) {
            this.tasks[i].update();
        }

        // check all task is end.
        for(let i = 0; i < this.tasks.length; i++) {
            if (this.tasks[i].isStart) return;
        }
        this.end();
    }

    end() {
        super.end();
    }
}


export interface ITask {

    name:string;
    isStart:boolean;
    isWait:boolean;
    start();
    end();
    break();
    update();

}

