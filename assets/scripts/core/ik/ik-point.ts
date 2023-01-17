import { _decorator,  Node, Vec3,  Quat } from 'cc';
export default class Point {
    public node: Node | null = null;
    public weight: number = 1.0;
    public solverPosition: Vec3 = new Vec3();
    public solverRotation:Quat = new Quat(); // Identity
    public defaultLocalPosition:Vec3 = new Vec3();
    public defaultLocalRotation:Quat = new Quat();

    public storeDefaultLocalState () {
    	this.node?.getPosition(this.defaultLocalPosition);
    	this.node?.getRotation(this.defaultLocalRotation);
    }

    public fixTransform () {
    	if (!this.node?.position.equals(this.defaultLocalPosition)) {
    		this.node?.setPosition(this.defaultLocalPosition);
    	}

    	if (!this.node?.rotation.equals(this.defaultLocalRotation)) {
    		this.node?.setRotation(this.defaultLocalRotation);
    	}
    }

    public updateSolverPosition () {
    	this.node?.getWorldPosition(this.solverPosition);
    }

    public updateSolverState () {
    	this.node?.getWorldPosition(this.solverPosition);
    	this.node?.getWorldRotation(this.solverRotation);
    }

    public updateSolverLocalState () {
    	this.node?.getPosition(this.solverPosition);
    	this.node?.getRotation(this.solverRotation);
    }
}