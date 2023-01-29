import { _decorator, clamp, Component, EventKeyboard, EventMouse, Input, input, KeyCode, Node, v3, Vec3 } from 'cc';
import { ActorMove } from '../logic/actor/actor-move';
const { ccclass, property } = _decorator;

@ccclass('TestActorMove')
export class TestActorMove extends Component {

    @property( {type:ActorMove, tooltip:' Reference Actor Move Slope.'} )
    actorMove:ActorMove | undefined;

    _dir:Vec3 = v3(0, 0, 0);

    direction_up = 0;
    direction_down = 0;
    direction_left = 0;
    direction_right = 0;

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
    }


    onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP) this.direction_up = -1;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN) this.direction_down = 1; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = -1;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 1;
        if (event.keyCode == KeyCode.SPACE) this.actorMove?.jump();
        this.onMove(); 
    }

    onKeyUp(event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W || event.keyCode === KeyCode.ARROW_UP)  this.direction_up = 0;
        if (event.keyCode === KeyCode.KEY_S || event.keyCode === KeyCode.ARROW_DOWN)  this.direction_down = 0; 
        if (event.keyCode === KeyCode.KEY_A || event.keyCode === KeyCode.ARROW_LEFT) this.direction_left = 0;
        if (event.keyCode === KeyCode.KEY_D || event.keyCode === KeyCode.ARROW_RIGHT) this.direction_right = 0;
        this.onMove();
    }

    onMouseDown(event: EventMouse) {
        
    }

    onMouseMove(event: EventMouse) {
        this.actorMove?.onRotation(event.movementX / 5, event.movementY / 10);
    }


    onMove() {
        this._dir.x = this.direction_left + this.direction_right;
        this._dir.z = this.direction_up + this.direction_down;
        this._dir.y = 0;
        //console.log('dir:', this._dir);
        this.actorMove?.moveDirection(this._dir.normalize());
    }

}

