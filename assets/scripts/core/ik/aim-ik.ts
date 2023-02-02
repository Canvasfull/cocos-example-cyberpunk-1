import { _decorator, Component, Node, CCFloat } from 'cc';
import IKBone from './ik-bone';
import IKSolverAim from './ik-solver-aim';
const { ccclass, property } = _decorator;

@ccclass('AimIK')
export default class AimIK extends Component {
  public solver: IKSolverAim = new IKSolverAim(this.node);

  @property({ type: Node, tooltip: 'this node that we want to aim at ikPosition.' })
  public rootNode : Node | null = null;

  @property({ type: Node, tooltip: 'this node that we want to aim at ikPosition.' })
  public aimNode : Node | null = null;

  @property({ type: [Node], tooltip: 'bones node' })
  public boneNodes: Array<Node> = [];

  @property({ type: [CCFloat], tooltip: 'bones weight' })
  public boneWeights : Array<number> = [];

  public enableAim: boolean = true;

  start () {
  	this.boneNodes.forEach((node, index) => {
  		this.solver.bones.push(new IKBone(node, this.boneWeights[index]));
  	});

  	this.solver.rootNode = this.rootNode;
  	this.solver.aimNode = this.aimNode;
  }

  update () {
  	this.enableAim && this.solver.update();
  }

  lateUpdate () {
  	this.enableAim &&	this.solver.lateUpdate();
  }
}