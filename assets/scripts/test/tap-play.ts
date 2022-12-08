import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, game, director, Scene } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TapPlay')
export class TapPlay extends Component {

    start() {

        game.pause();

        input.on(Input.EventType.KEY_UP, (event:EventKeyboard)=>{

            if (event.keyCode === KeyCode.SPACE) {
                game.resume();
            }

            if (event.keyCode === KeyCode.KEY_R) {
                
            }

        }, this)

    }
}

