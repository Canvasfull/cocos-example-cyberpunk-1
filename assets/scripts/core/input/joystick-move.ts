/*
 Copyright (c) 2020-2023 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

import { _decorator, Component, Node, Vec3, Input, EventTouch, v3, Vec2, v2, Rect, UITransform, game, Camera } from 'cc';
import { InputJoystick } from './input-joystick';
import { UI } from '../ui/ui';
import { UtilVec3 } from '../util/util';
import { fun } from '../util/fun';
const { ccclass, property } = _decorator;

@ccclass('JoystickMove')
export class JoystickMove extends Component {

    @property(Number)
    radius = 20;

    @property(Number)
    smooth = 5;

    @property(Boolean)
    autoHidden:Boolean = false

    @property(Number)
    runRadius = 80;

    _pos:Vec3 = v3(0, 0, 0);
    _movePos:Vec3 = v3(0, 0, 0);

    _tempMove:Vec3 = v3(0, 0, 0);

    _moveNode:Node | undefined;
    _bgNode:Node | undefined;

    _input:InputJoystick | undefined;

    ui_camera:Camera | undefined;

    screenVec3 = v3(0, 0, 0);
    screenCenter = v3(0, 0, 0);
    worldPosition = v3(0, 0, 0);

    isStart = false;

    @property(Node)
    nodeTestCenter:Node | undefined;

    start() {

        //bind input joystick
        this._input = this.node.parent!.getComponent(InputJoystick)!;

        //Get the joystick node.
        this._bgNode = this.node.children[0];
        this._moveNode = this._bgNode.children[0];

        // Register for touch events.
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        //Get the ui camera.
        this.ui_camera = UI.Instance.camera;

        fun.delay(()=>{
            // Init default position.
            UtilVec3.copy(this._pos, this.node.worldPosition);
        }, 1)
        

    }

    /**
     * Unregister when the node is destroyed.
     */
    onDestroy() {
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Input.EventType.TOUCH_CANCEL, this.onTouchCancel, this); 
    }

    onTouchStart(event: EventTouch) {

        this.isStart = true;

        // Get the center screen coordinates.
        this.ui_camera?.worldToScreen(this.node.worldPosition, this.screenCenter);

        this.calculateMoveDirection(event);

        if (this.autoHidden) this.node.emit('autoHidden', false);
    }

    /**
     * On touch move event.
     * @param event 
     */
    onTouchMove(event: EventTouch) {
        this.calculateMoveDirection(event);
    }

    /**
     * On touch end event.
     * @param event 
     */
    onTouchEnd(event: EventTouch) {
        this.cancelTouch();
    }

    /**
     * On touch cancel event.
     * @param event 
     */
    onTouchCancel(event: EventTouch) {
        this.cancelTouch();
    }

    /**
     * Calculate the direction of movement of the character.
     * @param event 
     */
    calculateMoveDirection(event: EventTouch) {

        this.isStart = false;

        // Get screen coordinates.
        this._pos.x = event.getLocationX();
        this._pos.y = event.getLocationY();

        this.screenVec3.x = this._pos.x;
        this.screenVec3.y = this._pos.y;

        this.ui_camera?.screenToWorld(this.screenVec3, this._pos);

        //UtilVec3.copy(this._)

        // Get the movement difference of the touch on the screen.
        this._pos.subtract(this.node.worldPosition);

        // Get move length.
        this._pos.z = 0;
        const len = this._pos.length();
        
        console.log('len:', len);
        // Override position beyond move radius.
        if (len > this.radius) {
            this._pos.normalize().multiplyScalar(this.radius);
        }

        // Judging the magnitude of remote sensing to determine whether to run.
        const isRun = len > this.runRadius;

        UtilVec3.copy(this._tempMove, this._pos);

        //Assign the Y direction of the screen to the Z direction of the movement.
        this._tempMove.z = this._tempMove.y;
        this._tempMove.y = 0;

        // Inverts the left and right direction of the telemetry.
        this._tempMove.x = -this._tempMove.x;

        // Set the character's running state.
        this._input?.onSetRun(isRun);

        // Call the character input interface to perform the movement operation.
        this._input?.onMove(this._tempMove.normalize());

        this._pos.add(this.node.worldPosition);
    }

    /**
     * The touch event is canceled.
     */
    cancelTouch() {
        // Reset the touch point to the center.
        UtilVec3.copy(this._pos, this.node.worldPosition);
        this._input?.onMove(Vec3.ZERO);
        if (this.autoHidden) this.node.emit('autoHidden', true);
    }

    /**
     * Each frame smoothly updates the remote sensing position.
     * @param deltaTime 
     */
    update(deltaTime: number) {

        Vec3.lerp(this._movePos, this._movePos, this._pos, deltaTime * this.smooth);
        this._moveNode!.setWorldPosition(this._movePos.x, this._movePos.y, 0);
        
    }
}

