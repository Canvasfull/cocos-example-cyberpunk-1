import { Component, MeshRenderer, ParticleSystem, renderer, _decorator } from "cc";

const { ccclass, executeInEditMode, property } = _decorator;

export let TransparentDepth = {
    objects: [] as TransparentDepthObject[]
}

@ccclass('TransparentDepthObject')
@executeInEditMode
export class TransparentDepthObject extends Component {
    @property
    priority = 0;

    model: renderer.scene.Model;

    onEnable () {
        let mr = this.getComponent(MeshRenderer);

        let model;
        if (mr) {
            model = mr.model;
        }

        let particle = this.getComponent(ParticleSystem);
        if (particle) {
            model = particle.processor.getModel();
        }

        this.model = model;

        if (model) {
            TransparentDepth.objects.push(this);
            this.resort();
        }
    }
    onDisable () {
        let index = TransparentDepth.objects.indexOf(this);
        if (index !== -1) {
            TransparentDepth.objects.splice(index, 1);
            this.resort();
        }
    }

    resort () {
        TransparentDepth.objects.sort((a, b) => {
            return a.priority - b.priority;
        })
    }

}
