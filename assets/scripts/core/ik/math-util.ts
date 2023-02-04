import { _decorator, Vec3, Node, Mat4, Quat, geometry, PhysicsSystem, physics, Vec2, math, director, quat, game } from 'cc';
//import { ColliderGroup, ControlType, CameraRotateType } from '../scene/define';
const { ccclass, property } = _decorator;

let _tempQuat: Quat = new Quat();
let _tempVec3: Vec3 = new Vec3;
let _tempVec3_2: Vec3 = new Vec3;

let _tempMat: Mat4 = new Mat4;
let _tempMat_2: Mat4 = new Mat4;

let _forward: Vec3 = new Vec3(0, 0, 1);

let _ray: geometry.Ray = new geometry.Ray;

@ccclass('MathUtil')
export default class MathUtil {
    public static degreesToRadians (degValue: number): number {
        return degValue * (Math.PI / 180.0);
    }

    public static radiansToDegrees (radValue: number): number {
        return radValue * (180.0 / Math.PI);
    }

    public static clamp01 (value: number): number {
        if (value < 0) return 0;
        if (value > 1) return 1;
        return value;
    }

    public static clampDegrees (value: number, min: number = -180, max: number = 180): number {
        while (value < min) {
            value += 360;
        }
        while (value > max) {
            value -= 360;
        }
        return value;
    }

    public static transformDegreesToNear (value: number, target: number) {
        if (Math.abs(value - target) < 180) return value;
        if (value < target) {
            while (value < target) {
                value += 360;
            }
            return value;
        }
        while (value > target) {
            value -= 360;
        }
        return value;
    }

    public static clamp (value: number, min: number, max: number): number {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    public static inverseLerp (a: number, b: number, v: number) {
        let ba = b - a;
        if (Math.abs(ba) < 0.000001) return 0;
        v = (v - a) / ba;
        return MathUtil.clamp01(v);
    }

    public static remap (x: number, a: number, b: number, c: number, d: number): number {
        let remappedValue: number = c + (x - a) / (b - a) * (d - c);
        return remappedValue;
    }

    public static convertToNodeSpace (out: Vec3, worldPosition: Vec3, node: Node) {
        node.getWorldMatrix(_tempMat);
        Mat4.invert(_tempMat_2, _tempMat);
        return Vec3.transformMat4(out, worldPosition, _tempMat_2);
    }

    public static convertToWorldSpace (out: Vec3, localPosition: Vec3, node: Node) {
        node.getWorldMatrix(_tempMat);
        return Vec3.transformMat4(out, localPosition, _tempMat);
    }

    public static randomInt (min: number, max: number) {
        if (min > max) return -1;
        return min + Math.round((max - min) * Math.random());
    }

    public static directionToNodeSpace (out: Vec3, worldDirection: Vec3, node: Node) {
        node.getWorldPosition(_tempVec3);
        _tempVec3.add(worldDirection);
        MathUtil.convertToNodeSpace(out, _tempVec3, node);
        return out;
    }

    public static getWorldLine (beginNode: Node, endNode: Node, worldRotation: Quat, worldPosition: Vec3) {
        beginNode.getWorldPosition(_tempVec3);
        endNode.getWorldPosition(_tempVec3_2);

        Vec3.lerp(worldPosition, _tempVec3, _tempVec3_2, 0.5);

        _tempVec3_2.subtract(_tempVec3);
        let length = _tempVec3_2.length();
        _tempVec3_2.normalize();

        Quat.rotationTo(worldRotation, _forward, _tempVec3_2);
        return length;
    }

    public static getWorldLineByPos (beginPos: Vec3, endPos: Vec3, worldRotation: Quat, worldPosition: Vec3) {
        Vec3.copy(_tempVec3, beginPos);
        Vec3.copy(_tempVec3_2, endPos);

        Vec3.lerp(worldPosition, _tempVec3, _tempVec3_2, 0.5);

        _tempVec3_2.subtract(_tempVec3);
        let length = _tempVec3_2.length();
        _tempVec3_2.normalize();

        Quat.rotationTo(worldRotation, _forward, _tempVec3_2);
        return length;
    }

    /*
    public static getFieldViewPoint (points: Node[], testPoint: Node, resultPoints: Node[], pointMask = ColliderGroup.PathPointAim, resultPointsMap: Map<Node, boolean> | null = null, yEnoughDistance = 99999) {
        testPoint.getWorldPosition(_tempVec3);
        resultPoints.length = 0;
        if (resultPointsMap) {
            resultPointsMap.clear();
        }

        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            if (testPoint == point) continue;

            point.getWorldPosition(_tempVec3_2);

            let yDistance = Math.abs(_tempVec3.y - _tempVec3_2.y);
            if (yDistance > yEnoughDistance) continue;

            Vec3.subtract(_tempVec3_2, _tempVec3_2, _tempVec3);
            _tempVec3_2.normalize();
            geometry.Ray.set(_ray,
                _tempVec3.x, _tempVec3.y, _tempVec3.z,
                _tempVec3_2.x, _tempVec3_2.y, _tempVec3_2.z);

            let hasHit = PhysicsSystem.instance.raycastClosest(_ray, pointMask);
            if (!hasHit) continue;
            let hitResult = PhysicsSystem.instance.raycastClosestResult;
            if (hitResult.collider.node != point) continue;

            (point as any).__distance = hitResult.distance;
            resultPoints.push(point);
            if (resultPointsMap) {
                resultPointsMap.set(point, true);
            }
        }

        resultPoints.sort((a, b) => (a as any).__distance - (b as any).__distance);
        return resultPoints;
    }
    */

    public static distance (a: Node, b: Node) {
        a.getWorldPosition(_tempVec3);
        b.getWorldPosition(_tempVec3_2);
        return Vec3.distance(_tempVec3, _tempVec3_2);
    }

    public static hDistance (a: Vec3, b: Vec3) {
        Vec3.copy(_tempVec3, a);
        Vec3.copy(_tempVec3_2, b);
        _tempVec3.y = 0;
        _tempVec3_2.y = 0;
        return Vec3.distance(_tempVec3, _tempVec3_2);
    }

    public static getMoveDirectionByCameraDirection (out:Vec3, rotateValue: Vec2, rotateVector: Vec3, node: Node) {
        let x = rotateValue.x;
        let y = rotateValue.y;
        let deg = Math.atan2(-y, x) - Math.PI * 0.5;

        Vec3.rotateY(out, rotateVector, Vec3.ZERO, deg);
        return out;
    }

    public static getLocalDegree (rotateValue: Vec2, rotateVector: Vec3, node: Node) {
        // because input is base on engine z and x axis, so it's like
        /*
            |
        ____|_____\ x
            |     /
            |
           \ /
           z
        */
        // now we need to handle direction with the camera observe direction, so we need to reversal the z axis, the z is primary movement's y axis
        // the x and y is zero when beginning, that's mean it point to x axis, but camera point to -z direction, so need to minus 90
        let x = rotateValue.x;
        let y = rotateValue.y;
        let deg = Math.atan2(-y, x) - Math.PI * 0.5;

        Vec3.rotateY(_tempVec3, rotateVector, Vec3.ZERO, deg);
        node.getWorldPosition(_tempVec3_2);
        _tempVec3_2.add(_tempVec3);
        MathUtil.convertToNodeSpace(_tempVec3, _tempVec3_2, node);
        _tempVec3.y = 0;
        _tempVec3.normalize();
        return MathUtil.radiansToDegrees(Math.atan2(_tempVec3.x, _tempVec3.z));
    }

    public static smoothDamp (current:number, target:number, currentVelocity: {value:number}, smoothTime:number, maxSpeed:number = 100) {
        smoothTime = Math.max(0.0001, smoothTime);
        let num1 = 2.0 / smoothTime;
        let num2 = num1 * game.deltaTime;
        let num3 = (1.0 / (1.0 + num2 + 0.479999989271164 * num2 * num2 + 0.234999999403954 * num2 * num2 * num2));
        let num4 = current - target;
        let num5 = target;
        let max = maxSpeed * smoothTime;
        let num6 = MathUtil.clamp(num4, -max, max);
        target = current - num6;
        let num7 = (currentVelocity.value + num1 * num6) * game.deltaTime;
        currentVelocity.value = (currentVelocity.value - num1 * num7) * num3;
        let num8 = target + (num6 + num7) * num3;
        if (num5 - current > 0.0 == num8 > num5)
        {
            num8 = num5;
            currentVelocity.value = (num8 - num5) / game.deltaTime;
        }
        return num8;
    }

    // it equal Quat.rotationTo(_tempQuat, fromDir.normalize(), toDir.normalize());
    public static fromToRotation (out:Quat, fromDir:Vec3, toDir:Vec3) {
        if (fromDir.equals(Vec3.ZERO) || toDir.equals(Vec3.ZERO)) return Quat.IDENTITY;

        // fromDir normalize by max
        let max = Math.abs(fromDir.x);
        max = max > Math.abs(fromDir.y) ? max : Math.abs(fromDir.y);
        max = (max > Math.abs(fromDir.z)) ? max : Math.abs(fromDir.z);
        fromDir = fromDir.multiplyScalar(1 / max); //    fromDir = fromDir / max;

        // toDir normalize by max
        max = Math.abs(toDir.x);
        max = (max > Math.abs(toDir.y)) ? max : Math.abs(toDir.y);
        max = (max > Math.abs(toDir.z)) ? max : Math.abs(toDir.z);
        toDir = toDir.multiplyScalar(1 / max); //         toDir = toDir / max;

        // set miniThreshold
        let miniThreshold = 0.001;
        fromDir.x = Math.abs(fromDir.x) <= miniThreshold ? 0 : fromDir.x;
        fromDir.y = Math.abs(fromDir.y) <= miniThreshold ? 0 : fromDir.y;
        fromDir.z = Math.abs(fromDir.z) <= miniThreshold ? 0 : fromDir.z;
        toDir.x = Math.abs(toDir.x) <= miniThreshold ? 0 : toDir.x;
        toDir.y = Math.abs(toDir.y) <= miniThreshold ? 0 : toDir.y;
        toDir.z = Math.abs(toDir.z) <= miniThreshold ? 0 : toDir.z;

        Vec3.normalize(_tempVec3, toDir);
        Vec3.normalize(_tempVec3_2, fromDir);
        Vec3.add(_tempVec3, _tempVec3, _tempVec3_2);

        let mid:Vec3 = new Vec3();
        Vec3.normalize(mid, _tempVec3);
        if (mid.equals(Vec3.ZERO))
        {
            // X
            if (fromDir.x != 0 && fromDir.y == 0 && fromDir.z == 0) { return new Quat(0, 1, 0, 0) }
            // Y
            else if (fromDir.x == 0 && fromDir.y != 0 && fromDir.z == 0) { return new Quat(1, 0, 0, 0) }
            // Z
            else if (fromDir.x == 0 && fromDir.y == 0 && fromDir.z != 0) { return new Quat(1, 0, 0, 0) }
            // X
            else if (fromDir.x == 0 && fromDir.y != 0 && fromDir.z != 0) { return new Quat(1, 0, 0, 0) }
            // Y
            else if (fromDir.x != 0 && fromDir.y == 0 && fromDir.z != 0)
            {
                Vec3.normalize(_tempVec3, toDir);
                Vec3.normalize(_tempVec3_2, fromDir);
                let X = _tempVec3.z;
                let Z = _tempVec3_2.x;

                if (X + Z < 0 || (X + Z == 0 && X < 0)) { return new Quat(-X, 0, -Z, 0) }
                else { return new Quat(X, 0, Z, 0) }
            }
            // Z
            else if (fromDir.x != 0 && fromDir.y != 0 && fromDir.z == 0)
            {
                Vec3.normalize(_tempVec3, toDir);
                Vec3.normalize(_tempVec3_2, fromDir);
                let X = _tempVec3.y;
                let Y = _tempVec3_2.x;

                if (X + Y < 0 || (X + Y == 0 && X < 0)) { return new Quat(-X, -Y, 0, 0) }
                else { return new Quat(X, Y, 0, 0) }
            }
            else
            {
                mid.y = fromDir.z;
                mid.z = toDir.y;
                mid.normalize();
            }
        }
        Vec3.normalize(_tempVec3, toDir);
        Vec3.normalize(_tempVec3_2, mid);
        Quat.multiply(out, new Quat(-_tempVec3.x, -_tempVec3.y, -_tempVec3.z, 0), new Quat(_tempVec3_2.x, _tempVec3_2.y, _tempVec3_2.z, 0));
        return out;
    }

    public static deltaAngle (src:number, tar:number) {
        src = src % 360;
        tar = tar % 360;
        return tar - src > 180 ? (src - tar) : tar - src;
    }

    // axisAngle = Quat.fromAxisAngle
    public static axisAngle (out:Quat, a1:Vec3, angle:number) {
        let s = Math.sin(angle / 2);
        out = new Quat(a1.x * s, a1.y * s, a1.z * s, Math.cos(angle / 2));
        return out;
    }

    // Quat.lerp normalize out
    public static quatLerp (out: Quat, a: Quat, b: Quat, t: number) {
        if (Quat.dot(a, b) < 0.0) {
            _tempQuat.set(-b.x, -b.y, -b.z, -b.w);
        }
        else {
            _tempQuat.set(b);
        }
        Quat.lerp(out, a, _tempQuat, MathUtil.clamp01(t));
        Quat.normalize(out, out);
        return out;
    }

    //  Vector sLerp
    // 	v(t) = k(t)*(v1 + t*(v2-v1))
    //  k(t) = |v1|/|v(t)|=|v1|/|v1+t*(v2-v1)|
    public static sLerp (out:Vec3, a: Vec3, b:Vec3, t: number) {
        Vec3.subtract(_tempVec3, b, a);
        Vec3.multiplyScalar(_tempVec3, _tempVec3, t);
        Vec3.add(_tempVec3_2, a, _tempVec3);

        let k = a.length() / _tempVec3_2.length();
        Vec3.multiplyScalar(out, _tempVec3_2, k);
        return out;
    }


    public static orthoNormalize (outA:Vec3, outB: Vec3, direction:Vec3, center:Vec3) {
        Vec3.normalize(_tempVec3, direction);
        Vec3.rotateY(outA, _tempVec3, center, 90);
        Vec3.cross(outB, outA, _tempVec3);
    }

    public static clampVec3 (out:Vec3, minVec:Vec3 | null = null, maxVec:Vec3|null = null) {
        if (minVec) {
            if (out.x < minVec.x) {
                out.x = minVec.x;
            }
            if (out.y < minVec.y) {
                out.y = minVec.z;
            }
            if (out.z < minVec.y) {
                out.z = minVec.z;
            }
        }

        if (maxVec) {
            if (out.x > maxVec.x) {
                out.x = maxVec.x;
            }
            if (out.y > maxVec.y) {
                out.y = maxVec.z;
            }
            if (out.z > maxVec.y) {
                out.z = maxVec.z;
            }
        }

        return out;
    }
}
