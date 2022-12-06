import { _decorator, Component, Node, find, Camera, input, Input, EventTouch, director, PhysicsSystem, EventMouse, geometry, v2 } from 'cc';
import { Msg } from '../msg/msg';
import { InputBase } from './input-base';
const { ccclass, property } = _decorator;

@ccclass('InputMouse')
export class InputMouse extends InputBase {

    _ray: geometry.Ray = new geometry.Ray();
    _screenPos = v2(0, 0);
    _camera: Camera = Object.create(null);

    @property
    mask_group = 3;

    start () {
        var cameraCtr = find('camera_controller');
        if (cameraCtr) {
            this._camera = cameraCtr.children[0].children[0].getComponent(Camera);
        } else {
            console.warn('Can not find camera-controller.');
        }
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onDestroy () {
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    onTouchStart (event: EventTouch) {
        //this._actorInput?.onStart(); 
    }

    onTouchMove (event: EventTouch) {
        const mask = (1 << this.mask_group);
        event.getLocation(this._screenPos);
        let shadingScale = director.root.pipeline.pipelineSceneData.shadingScale
        this._camera.screenPointToRay(this._screenPos.x * shadingScale, this._screenPos.y * shadingScale, this._ray);
        if (PhysicsSystem.instance.raycastClosest(this._ray, mask, 100)) {
            var res = PhysicsSystem.instance.raycastClosestResult;
            var hit = res.hitPoint;
            hit.subtract(res.collider.node.worldPosition);
            hit.y = 0;
            //this._actorInput?.onMove(hit, undefined);
        }
    }

    onMouseMove (event: EventMouse) {
        const mask = (1 << this.mask_group);
        event.getLocation(this._screenPos);
        let shadingScale = director.root.pipeline.pipelineSceneData.shadingScale
        this._camera.screenPointToRay(this._screenPos.x * shadingScale, this._screenPos.y * shadingScale, this._ray);
        if (PhysicsSystem.instance.raycastClosest(this._ray, mask, 100)) {
            var res = PhysicsSystem.instance.raycastClosestResult;
            var hit = res.hitPoint;
            hit.subtract(res.collider.node.worldPosition);
            hit.y = 0;
            //this._actorInput?.onMove(hit, undefined);
        }
    }

    onTouchEnd (event: EventTouch) {
        //this._actorInput?.onEnd();
    }

    onTouchCancel(event: EventTouch) {
        //this._actorInput?.onEnd();
    }

}