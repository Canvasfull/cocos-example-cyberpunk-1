import { LGraphNode } from '../@types/litegraph';
import { BaseStage } from '../../stages/base-stage';
import { liteGraph } from '../graph';
import { updateNextNodes } from '../utils/nodes';

export function Router () {
    let self = this as LGraphNode;

    self.addInput('RenderTexture 1', 'RenderTexture');
    self.addInput('RenderTexture 2', 'RenderTexture');
    self.addInput('RenderTexture 3', 'RenderTexture');

    self.addOutput('Output', 'RenderTexture');

    this.onUpdateStage = function updateStage (prev: LGraphNode, stages: BaseStage[]) {
        (self as any).stage = (prev as any).stage
        updateNextNodes(self, stages);
    }

    self.size = self.computeSize();
}

delete liteGraph.registered_node_types[`input/Router`];
liteGraph.registerNodeType(`input/Router`, Router as any);
