import { LGraphNode } from '../@types/litegraph';
import { liteGraph } from '../graph';

export function Vec2 () {
    let self = this as LGraphNode;

    this.properties = {
        x: 1,
        y: 1,
    }

    self.addWidget('number', 'x', 1, 'x');
    self.addWidget('number', 'y', 1, 'y');

    self.addOutput('Output', 'vec2');

    let output = [];

    self.onExecute = function () {
        output[0] = this.properties.x;
        output[1] = this.properties.y;
        this.setOutputData(0, output);
    }

    self.size = self.computeSize();
}

delete liteGraph.registered_node_types[`input/Vec2`];
liteGraph.registerNodeType(`input/Vec2`, Vec2 as any);
