
import { RenderQulity } from '../../settings/gpu';
import { renderSetting } from '../../settings/render-setting';
import { BaseStage } from '../../stages/base-stage';
import { LGraphNode } from '../@types/litegraph';
import { liteGraph } from '../graph';
import { updateNextNodes } from '../utils/nodes';

export function RenderQulityNode () {
    let self = this as LGraphNode;

    self.properties = {
        High: false,
        Medium: false,
        Low: false
    }

    self.addWidget('toggle', 'High', false, 'High')
    self.addWidget('toggle', 'Medium', false, 'Medium')
    self.addWidget('toggle', 'Low', false, 'Low')

    self.addInput('RenderTexture', 'RenderTexture');
    self.addOutput('Output', 'RenderTexture');


    this.stage = null

    this.onUpdateStage = function updateStage (prev: LGraphNode, stages: BaseStage[]) {
        (self as any).stage = (prev as any).stage

        if (renderSetting.quality === RenderQulity.High && self.properties.High ||
            renderSetting.quality === RenderQulity.Medium && self.properties.Medium ||
            renderSetting.quality === RenderQulity.Low && self.properties.Low) {
            updateNextNodes(self, stages)
        }

    }

    self.size = self.computeSize();
}

delete liteGraph.registered_node_types[`input/RenderQulity`];
liteGraph.registerNodeType(`input/RenderQulity`, RenderQulityNode as any);
