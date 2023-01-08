import { _decorator, Component, Node, Vec3, v3 } from 'cc';
import { UtilVec3 } from './util';
const { ccclass, property } = _decorator;

@ccclass('ui_roller')
export class ui_roller extends Component {

    _orignal:Vec3;

    @property
    final:Vec3 = v3(0, 0, 0);

    @property
    speed:number = 10;

    _pos:Vec3 = v3(0, 0, 0);

    start() {

    }

    onEnable() {
        if (this._orignal === undefined) {
            this._orignal = this.node.position.clone();
        }

        this.node.setPosition(this._orignal.x, this._orignal.y, this._orignal.z);
        UtilVec3.copy(this._pos, this._orignal);
    }

    update(deltaTime: number) {

        if (this._pos.y < this.final.y) {
            this._pos.y += deltaTime * this.speed;
            this.node.setPosition(this._pos.x, this._pos.y, this._pos.z);
        }
        
    }

}

