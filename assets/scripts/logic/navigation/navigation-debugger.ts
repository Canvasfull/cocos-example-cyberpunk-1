import { _decorator, Component, Node, Camera, v3, Color, renderer, debug, director } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('navigation_debugger')
@executeInEditMode
export class navigation_debugger extends Component {    

    start() {
        
    }

    update(deltaTime: number) {
        if(EDITOR) this.editorUpdate();
    }

    editorUpdate() {
        const render = director.root?.pipeline.geometryRenderer;
        render?.addLine(v3(0, 0, 0), v3(3, 0, 3), Color.GREEN, false);
    }
}

