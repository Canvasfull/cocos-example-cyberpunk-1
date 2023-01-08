
import { _decorator, Component, Node, find, Vec3, v3 } from 'cc';
import { Msg } from '../../core/msg/msg';
import { GVec3 } from '../../core/util/g-math';
import { UtilVec3 } from '../../core/util/util';
import { SmoothLocalZ } from './smooth-local-z';
const { ccclass, property } = _decorator;
@ccclass('CameraController')
export class CameraController extends Component {

    @property
    smooth: number = 0.5;
    @property
    maxOffsetZ: number = 2;
    @property
    target: string = 'actor';

    _velocity: Vec3 = new Vec3(0, 0, 0);
    _followTarget: Node = Object.create(null);

    _offsetZ: number = 0;
    _offsetZScale: number = 1;
    _target: Vec3 = v3(0, 0, 0);
    _dir: Vec3 = v3(0, 0, 0);
    _pos: Vec3 = v3(0, 0, 0);

    controlZ: SmoothLocalZ = Object.create(null);

    start () {
        this._followTarget = find(this.target);
        this._target = this._followTarget.position.clone();
        UtilVec3.copy(this._pos, this._target);
        this.node.setWorldPosition(this._target);
        this.controlZ = this.node.children[0].children[0].getComponent(SmoothLocalZ);
        Msg.bind('set_camera_len', this.setLen, this);
        Msg.bind('set_offset_scale', this.setOffsetScale, this);

        console.log('camera controller:', this.node.worldPosition);
    }

    onDestroy () {
        Msg.off('set_camera_len', this.setLen);
        Msg.off('set_offset_scale', this.setOffsetScale);
    }

    setLen (offset: number) {
        
        this.controlZ.setOffset(offset);
    }

    setOffsetScale (scale: number) {
        
        //this._offsetZScale = 1 - scale;
    }

    lateUpdate (deltaTime: number) {
        this.smoothDamp(deltaTime);
    }

    smoothDamp (deltaTime: number) {
        //UtilVec3.copy(this._pos, this.node.position);
        UtilVec3.copy(this._target, this._followTarget.position);
        UtilVec3.copy(this._dir, this._followTarget.forward);
        if (this._offsetZScale > 0)
            this._target.add(this._dir.multiplyScalar(this._offsetZ * this._offsetZScale));
        GVec3.smoothDamp(this._pos, this._target, this._velocity, this.smooth, deltaTime);
        //this._pos = val[0];
        //this._velocity = val[1];
        this.node.setWorldPosition(this._pos);
    }

}

/*
smoothLerp(deltaTime: number) {
    var pos = this.node.worldPosition;
    var target = this._followTarget.worldPosition;
    Vec3.lerp(pos, this._followTarget.worldPosition, pos, deltaTime * this.smooth);
}
*/