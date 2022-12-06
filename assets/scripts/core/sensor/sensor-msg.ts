import { _decorator, Component, Node, Collider, ITriggerEvent, ICollisionEvent, director, game } from 'cc';
import { Msg } from '../msg/msg';
const { ccclass, property } = _decorator;

@ccclass('SensorMsg')
export class SensorMsg extends Component {

    _collider: Collider = null;

    @property
    msg = '';

    @property
    data = '';

    @property
    exit_msg = '';

    @property
    exit_data = '';

    @property
    isHitRemove = false;

    @property([String])
    filter:string[] = [];

    _safeTime: number = 500;
    _curTime: number = 0;

    onEnable() {
        this._collider = this.getComponent(Collider);
        this.init();
    }

    onDisable() {
        this._collider.off('onTriggerEnter', this.onCollisionEnter, this);
        this._collider.off('onCollisionEnter', this.onCollisionEnter, this);
        if(this.exit_msg.length > 0) {
            this._collider.off('onTriggerExit', this.onTriggerExit, this);
            this._collider.off('onCollisionExit', this.onCollisionExit, this);
        }
    }

    init() {
        if (this.msg == '') {
            const array = this.node.name.split('#');
            this.msg = array[0];
            if (array.length >= 2) this.data = array[1];
        }
        this._collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this._collider.on('onCollisionEnter', this.onCollisionEnter, this);

        if(this.exit_msg.length > 0) {
            this._collider.on('onTriggerExit', this.onTriggerExit, this);
            this._collider.on('onCollisionExit', this.onCollisionExit, this);
        }

        this._curTime = game.totalTime;
    }

    onTriggerEnter (event: ITriggerEvent) {

        if(this.checkFilter(event.otherCollider.name)) return;
        
        if (this.msg == "actor_event") {
            event.otherCollider.node.emit('do', this.data);
        } else {
            Msg.emit(this.msg, this.data);
            event.otherCollider.emit('do', this.data);
        }
        if (this.isHitRemove) {
            this.node.active = false;
        }
    }

    onTriggerExit(event: ITriggerEvent) {

        if(this.checkFilter(event.otherCollider.name)) return;

        if (this.exit_msg == "actor_event") {
            event.otherCollider.node.emit('do', this.exit_data);
        } else {
            Msg.emit(this.exit_msg, this.exit_data);
            event.otherCollider.emit('do', this.exit_data);
        }
    }

    onCollisionEnter (event: ICollisionEvent) {

        if(this.checkFilter(event.otherCollider.name)) return;

        if (this.msg == "actor_event") {
            event.otherCollider.node.emit('do', this.data);
        } else {
            Msg.emit(this.msg, this.data);
        }
        if (this.isHitRemove) {
            this.node.active = false;
        }
    }

    onCollisionExit(event: ICollisionEvent) {

        if(this.checkFilter(event.otherCollider.name)) return;

        if (this.exit_msg == "actor_event") {
            event.otherCollider.node.emit('do', this.exit_data);
        } else {
            Msg.emit(this.exit_msg, this.exit_data);
        }
    }

    unSafeEnter (): boolean {
        const deltaTime = game.totalTime - this._curTime;
        if (game.totalTime - this._curTime > this._safeTime) {
            
            this._curTime = game.totalTime;
            return false;
        } else {
            return true;
        }
    }

    checkFilter(hit:string):boolean {

        for(let i = 0; i < this.filter.length; i++) {
            var f = this.filter[i];
            if(hit.includes(f)) return true;
        }

        return false;

    }

}