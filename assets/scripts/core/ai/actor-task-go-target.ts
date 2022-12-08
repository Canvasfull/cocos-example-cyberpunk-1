import { Vec3 } from "cc";
import { ITask, TaskBase } from "./actor-tasks";
import { ActorBase } from "../actor/actor-base";

export class ActorTaskGoTarget extends TaskBase {

    name = 'ActorActionWay';
    actor:ActorBase | undefined;
    index = 0;
    waypoints = [];

    isStart = false;

    public init(_actor:ActorBase) {
        this.actor = _actor;
    }

    public initWayPoints(_waypoints) {
        this.index = 0;
        this.waypoints = _waypoints;
    }

    public update() {
        if (!this.isStart) return;
        if (!this.isWait) return;
        // check arrived
        if (Vec3.distance(this.actor!._data.pos, this.waypoints[this.index].pos) < 0.1) {
            
            if (this.index >= this.waypoints.length) {
                this.end();
                return;
            }

            // check actor direction.
            var dir = this.waypoints[this.index + 1].clone();
            dir.subtract(this.actor!._data.pos);
            this.actor!.setDir(dir);

            // check action.
            this.onAction(this.waypoints[this.index].action);

        }

    }

    onAction(action: string) {
        this.actor!.do(action);
    }

}