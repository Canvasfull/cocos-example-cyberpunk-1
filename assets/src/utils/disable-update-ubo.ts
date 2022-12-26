import { _decorator, Component, Node, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('disable_update_ubo')
export class disable_update_ubo extends Component {
    start () {
        setTimeout(() => {
            let mrs = this.getComponentsInChildren(MeshRenderer);
            mrs.forEach(mr => {
                // mr.model.updateUBOs(0);
                let origin = mr.model.updateUBOs;
                mr.model.updateUBOs = function () {
                    if (!this._localDataUpdated) return;
                    origin.call(this)
                }
            })
        }, 1000)
    }
}


