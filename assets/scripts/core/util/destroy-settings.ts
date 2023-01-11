import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('destroySettings')
export class destroySettings extends Component {

    @property(Boolean)
    isDestroy = true;

    start() {
        if(this.isDestroy) director.addPersistRootNode(this.node);
    }
    
}

