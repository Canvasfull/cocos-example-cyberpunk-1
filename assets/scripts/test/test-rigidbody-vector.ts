import { _decorator, Component, Node, RigidBody, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestRigidBodyVector')
export class TestRigidBodyVector extends Component {

    @property(RigidBody)
    rigid:RigidBody | undefined;

    @property(Vec3)
    velocity:Vec3 = v3(0, 0, 0);

    start() {

    }

    lateUpdate(deltaTime: number) {

        this.node.setWorldPosition(this.rigid!.node.worldPosition);
        this.rigid!.getLinearVelocity(this.velocity);
        if(this.velocity.length() > 0.5) {
            this.velocity.add(this.node.worldPosition);
            this.node.lookAt(this.velocity);
        }
    }
}

