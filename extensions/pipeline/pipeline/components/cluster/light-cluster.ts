import { director, geometry, renderer, SphereLight, SpotLight, Vec4, _decorator } from "cc";
import { PipelineAssets } from "../../resources/pipeline-assets";
import { ClusterObject, WorldCluster } from "./world-cluster";

const { ccclass, executeInEditMode } = _decorator

let _sphere = new geometry.Sphere();

@ccclass('LightWorldCluster')
@executeInEditMode
export class LightWorldCluster extends WorldCluster<SphereLight | SpotLight> {
    // 0: pos.x, pos.y, pos.z, isSpotLight
    // 1: rgb: color, w: intensity
    // 2: x: size, y: range, z: spotAngle
    // 3: xyz: dir
    pixelsPerObjectFloat = 4;

    addObjectData (light: renderer.scene.SphereLight | renderer.scene.SpotLight, index: number) {
        const dataInfoFloat = this.dataInfoFloat!;
        let dataInfoFloatIndex = index * this.dataInfoTextureFloat!.width * 4;

        let isSpotLight = light instanceof renderer.scene.SpotLight;

        // 0
        let pos = light.node!.worldPosition;
        dataInfoFloat[dataInfoFloatIndex++] = pos.x;
        dataInfoFloat[dataInfoFloatIndex++] = pos.y;
        dataInfoFloat[dataInfoFloatIndex++] = pos.z;
        dataInfoFloat[dataInfoFloatIndex++] = isSpotLight ? 1 : 0;

        // 1
        const color = light.color;
        dataInfoFloat[dataInfoFloatIndex++] = color.x;
        dataInfoFloat[dataInfoFloatIndex++] = color.y;
        dataInfoFloat[dataInfoFloatIndex++] = color.z;

        const lightMeterScale = 10000;
        const defaultExposure = 0.00002604165638331324;
        dataInfoFloat[dataInfoFloatIndex++] = light.luminance * defaultExposure * lightMeterScale;

        // 2
        if (isSpotLight) {
            let spot = (light as renderer.scene.SpotLight);

            const clampedInnerConeAngle = Math.clamp(spot.size, 0.0, 89.0) * Math.PI / 180.0;
            const clampedOuterConeAngle = Math.clamp(spot.angle, clampedInnerConeAngle + 0.001, 89.0 * Math.PI / 180.0 + 0.001);

            let cosOuterCone = Math.cos(clampedOuterConeAngle);
            let cosInnerCone = Math.cos(clampedInnerConeAngle);
            let invCosConeDifference = 1.0 / (cosInnerCone - cosOuterCone);

            dataInfoFloat[dataInfoFloatIndex++] = light.range;
            dataInfoFloat[dataInfoFloatIndex++] = cosOuterCone;
            dataInfoFloat[dataInfoFloatIndex++] = invCosConeDifference;
        }
        else {
            dataInfoFloat[dataInfoFloatIndex++] = light.range;
            dataInfoFloat[dataInfoFloatIndex++] = light.size;
            dataInfoFloat[dataInfoFloatIndex++] = 0;
        }


        // 3
        if (isSpotLight) {
            let dir = (light as renderer.scene.SpotLight).direction;
            dataInfoFloat[dataInfoFloatIndex++] = dir.x;
            dataInfoFloat[dataInfoFloatIndex++] = dir.y;
            dataInfoFloat[dataInfoFloatIndex++] = dir.z;
        }

    }

    getBoundingBox (light: renderer.scene.SphereLight | renderer.scene.SpotLight, clusteredObject: ClusterObject<SphereLight | SpotLight>) {
        let worldPos = light.node!.worldPosition;
        geometry.Sphere.set(_sphere, worldPos.x, worldPos.y, worldPos.z, light.range);
        _sphere.getBoundary(clusteredObject.min, clusteredObject.max);
        clusteredObject.radius = light.range;
        clusteredObject.center.set(worldPos);
    }

    lights = []
    findObjects () {
        let lights = this.lights;
        lights.length = 0;
        for (let i = 0; i < director.root.scenes.length; i++) {
            let sphereLights = director.root.scenes[i].sphereLights;
            for (let ii = 0; ii < sphereLights.length; ii++) {
                lights.push(sphereLights[ii])
            }
            let spotLights = director.root.scenes[i].spotLights;
            for (let ii = 0; ii < spotLights.length; ii++) {
                lights.push(spotLights[ii])
            }
        }

        return lights
    }

    update (dt) {
        super.update(dt)

        let material = PipelineAssets.instance.getMaterial('deferred-lighting')
        if (material) {
            material.setProperty('light_cluster_BoundsMin', this.boundsMin)
            material.setProperty('light_cluster_BoundsDelta', this.boundsDelta)
            material.setProperty('light_cluster_CellsDot', this.clusterCellsDotData)
            material.setProperty('light_cluster_CellsMax', this.clusterCellsMaxData)
            material.setProperty('light_cluster_TextureSize', this.clusterTextureSizeData)
            material.setProperty('light_cluster_InfoTextureInvSize', this.infoTextureInvSizeData)
            material.setProperty('light_cluster_CellsCountByBoundsSizeAndPixelsPerCell', this.clusterCellsCountByBoundsSizeData)

            material.setProperty('light_cluster_InfoTexture', this.dataInfoTextureFloat);
            material.setProperty('light_cluster_Texture', this.clusterTexture);

            let pass = material.passes[0];
            let pointSampler = director.root.pipeline.globalDSManager.pointSampler
            let binding = pass.getBinding('light_cluster_InfoTexture')
            pass.bindSampler(binding, pointSampler)
            binding = pass.getBinding('light_cluster_Texture')
            pass.bindSampler(binding, pointSampler)
        }
    }
}
