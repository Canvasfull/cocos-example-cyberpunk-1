import { LGraphNode } from "../@types/litegraph";
import { BaseStage } from "../../stages/base-stage";

export function updateNextNodes (node: LGraphNode, stages: BaseStage[], outSlotID = 0, nexts?: LGraphNode[]) {
    nexts = nexts || node.getOutputNodes(outSlotID);
    if (!nexts) {
        return;
    }

    nexts.sort((a, b) => {
        return a.pos[1] - b.pos[1]
    })

    for (let i = 0; i < nexts.length; i++) {
        let next = nexts[i] as any;

        if (next.onUpdateStage) {
            next.onUpdateStage(node, stages)
        }
    }
}
