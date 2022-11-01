import { LGraphNode } from '../@types/litegraph';
import { BaseStage, } from '../../stages/base-stage';
import { CustomPipelineBuilder, } from '../../pipeline-manager';
import { liteGraph } from '../graph';
import { updateNextNodes } from '../utils/nodes';

function Pipeline () {
    let self = this as LGraphNode;
    self.addOutput('Camera Output', 'Camera Output');

    let stages: BaseStage[] = this.stages = [];
    let name = 'Pipeline_' + Date.now();

    CustomPipelineBuilder.registerStages(name, stages);

    self.addProperty('Name', name, undefined);
    self.addWidget("text", 'Name', name, 'Name');

    self.addProperty('Enable', true, undefined);
    self.addWidget("toggle", 'Enable', false, 'Enable');

    self.onPropertyChanged = function (name: string, value: string, prevalue: string) {
        if (name === 'Name') {
            CustomPipelineBuilder.unregisterStages(prevalue);
            CustomPipelineBuilder.registerStages(value, stages);
        }
    }

    self.onExecute = function () {
        stages.length = 0;

        if (!self.properties.Enable) {
            return;
        }

        updateNextNodes(self, stages);
    }

    self.size = self.computeSize();
}

delete liteGraph.registered_node_types[`pipeline/Pipeline`];
liteGraph.registerNodeType(`pipeline/Pipeline`, Pipeline as any);
