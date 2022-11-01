import { LGraphNode } from '../@types/litegraph';
import { BaseStage } from '../../stages/base-stage';
import { liteGraph } from '../graph';

export function OutputTexture () {
    let self = this as LGraphNode;
    self.addInput('RenderTexture', 'RenderTexture');

    self.addProperty('OutputName', '', undefined);
    self.addWidget("text", 'OutputName', '', 'OutputName');

    this.onUpdateStage = function updateStage (prev: LGraphNode, stages: BaseStage[]) {
        let stage = (prev as any).stage as BaseStage
        if (stage) {
            // stage.outputName = self.properties.OutputName
        }
    }

    self.size = self.computeSize();
}

delete liteGraph.registered_node_types[`pipeline/OutputTexture`];
liteGraph.registerNodeType(`pipeline/OutputTexture`, OutputTexture as any);
