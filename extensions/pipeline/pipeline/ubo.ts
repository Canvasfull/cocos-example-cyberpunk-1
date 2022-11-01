
export class UBOBase {
    static NAME = '';
    static BINDING = 0;
    static LAYOUT: gfx.UniformBlock | undefined;
    static DESCRIPTOR: gfx.DescriptorSetLayoutBinding | undefined;

    static ubo_index = 0;
    static increaseIndex(count: number) {
        let ret = this.ubo_index;
        this.ubo_index += count;
        return ret;
    }

    static get COUNT() {
        return this.ubo_index;
    };
    static get SIZE() {
        return this.COUNT * 4;
    }
}


// import { builtinResMgr, Director, director, ForwardPipeline, Game, game, gfx, pipeline, RenderTexture, sys, Texture2D, TextureCube } from "cc";

// const { PipelineGlobalBindings, globalDescriptorSetLayout, bindingMappingInfo } = pipeline;

// let BindingStart = PipelineGlobalBindings.COUNT;
// let BindingIndex = 0;


// // UBOCustomGlobal
// export class UBOCustomGlobal extends UBOBase {
//     /////////////////// water sdf /////////////////
//     static water_sdf = this.increaseIndex(4);        // xy: range, z: uv scale
//     static water_sdf2 = this.increaseIndex(4);        // xy: sdf center
//     /////////////////// water  /////////////////
//     static water = this.increaseIndex(4);        // x: water height
//     /////////////////// actor  /////////////////
//     static actor_pos = this.increaseIndex(4);
//     static actor_proj_pos = this.increaseIndex(4);
//     static actor_view_pos = this.increaseIndex(4);
//     /////////////////// render setting  /////////////////
//     static render_setting = this.increaseIndex(4);
//     /////////////////// sky  /////////////////
//     static sky_camera_pos = this.increaseIndex(4);
//     /////////////////// screen  /////////////////
//     static window_size = this.increaseIndex(4);

//     //
//     static readonly NAME = 'CCCustomGlobal';
//     static readonly BINDING = BindingStart + BindingIndex++;
//     static readonly DESCRIPTOR = new gfx.DescriptorSetLayoutBinding(this.BINDING, gfx.DescriptorType.UNIFORM_BUFFER, 1, gfx.ShaderStageFlagBit.ALL);

//     static readonly LAYOUT = new gfx.UniformBlock(pipeline.SetIndex.GLOBAL, this.BINDING, this.NAME, [
//         /////////////////// global /////////////////
//         new gfx.Uniform('cc_water_sdf', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_water_sdf2', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_water', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_actor_pos', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_actor_proj_pos', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_actor_view_pos', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_render_setting', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_sky_camera_pos', gfx.Type.FLOAT4, 1),
//         new gfx.Uniform('cc_window_size', gfx.Type.FLOAT4, 1),
//     ], 1)
// }


// export function registerUBO (ubo: typeof UBOBase) {
//     globalDescriptorSetLayout.layouts[ubo.NAME] = ubo.LAYOUT;
//     globalDescriptorSetLayout.bindings[ubo.BINDING] = ubo.DESCRIPTOR;

//     if (director.root) {
//         director.root.pipeline.descriptorSetLayout.bindings[ubo.BINDING] = ubo.DESCRIPTOR;
//         director.root.pipeline.descriptorSetLayout.bindingIndices[ubo.BINDING] = ubo.BINDING;
//         director.root.pipeline.descriptorSetLayout.descriptorIndices[ubo.BINDING] = ubo.BINDING;
//     }
// }

// export function registerTexture (name: string, type: gfx.Type, binding: number) {
//     try {
//         const UNIFORM_LAYOUT = new gfx.UniformSamplerTexture(pipeline.SetIndex.GLOBAL, binding, name, type, 1);
//         const UNIFORM_DESCRIPTOR = new gfx.DescriptorSetLayoutBinding(binding, gfx.DescriptorType.SAMPLER_TEXTURE, 1, gfx.ShaderStageFlagBit.FRAGMENT);

//         globalDescriptorSetLayout.layouts[name] = UNIFORM_LAYOUT;
//         globalDescriptorSetLayout.bindings[binding] = UNIFORM_DESCRIPTOR;

//         // director.root.pipeline.descriptorSetLayout.bindings[binding] = UNIFORM_DESCRIPTOR;
//         // director.root.pipeline.descriptorSetLayout.bindingIndices[binding] = binding;
//         // director.root.pipeline.descriptorSetLayout.descriptorIndices[binding] = binding;

//         // bindingMappingInfo.samplerOffsets[1]++;
//         // bindingMappingInfo.samplerOffsets[2]++;
//     }
//     catch (err) {
//         console.error(err)
//     }

//     return binding;
// }

// export let UBOCustomGlobalBuffer: gfx.Buffer | null = null;
// export const UBOCustomGlobalBufferArray = new Float32Array(UBOCustomGlobal.COUNT);


// // ssao
// export const UNIFORM_SSAO_BINDING = BindingStart + BindingIndex++;
// // scene depth
// export const UNIFORM_SCENE_DEPTH_BINDING = BindingStart + BindingIndex++;
// // scene color
// export const UNIFORM_SCENE_COLOR_BINDING = BindingStart + BindingIndex++;
// // water sdf
// export const UNIFORM_WATER_SDF_BINDING = BindingStart + BindingIndex++;
// // grass texture
// export const UNIFORM_GRASS_BINDING = BindingStart + BindingIndex++;

// export function bindTexture (binding: number, texture: Texture2D | TextureCube | RenderTexture, descriptorSet?: gfx.DescriptorSet) {
//     const pipeline = director.root!.pipeline as ForwardPipeline;
//     descriptorSet = descriptorSet || pipeline.descriptorSet;
//     descriptorSet.bindSampler(binding, texture.getGFXSampler());
//     descriptorSet.bindTexture(binding, texture.getGFXTexture()!);
// }
// export function bindGFXTexture (binding: number, texture: gfx.Texture, descriptorSet?: gfx.DescriptorSet, sampler?: gfx.Sampler) {
//     const pipeline = director.root!.pipeline as ForwardPipeline;
//     descriptorSet = descriptorSet || pipeline.descriptorSet;
//     sampler = sampler || director.root.pipeline.globalDSManager.linearSampler;
//     descriptorSet.bindTexture(binding, texture);
//     descriptorSet.bindSampler(binding, sampler);
// }

// export function getOrCreateBuffer (ubo: typeof UBOBase) {
//     let pipeline = director.root!.pipeline as ForwardPipeline;
//     let device = pipeline.device;
//     let buffer = pipeline.descriptorSet.getBuffer(ubo.BINDING);
//     if (!buffer) {
//         buffer = device.createBuffer(new gfx.BufferInfo(
//             gfx.BufferUsageBit.UNIFORM | gfx.BufferUsageBit.TRANSFER_DST,
//             gfx.MemoryUsageBit.HOST | gfx.MemoryUsageBit.DEVICE,
//             ubo.SIZE,
//         ));
//         pipeline.descriptorSet.bindBuffer(ubo.BINDING, buffer);
//     }
//     return buffer;
// }

// export function resetUBO () {
//     registerUBO(UBOCustomGlobal);

//     registerTexture('cc_ssao_map', gfx.Type.SAMPLER2D, UNIFORM_SSAO_BINDING);
//     registerTexture('cc_scene_depth', gfx.Type.SAMPLER2D, UNIFORM_SCENE_DEPTH_BINDING);
//     registerTexture('cc_scene_color', gfx.Type.SAMPLER2D, UNIFORM_SCENE_COLOR_BINDING);
//     registerTexture('cc_water_sdf_map', gfx.Type.SAMPLER2D, UNIFORM_WATER_SDF_BINDING);
//     registerTexture('cc_grass_map', gfx.Type.SAMPLER2D, UNIFORM_GRASS_BINDING);

//     let pipAny = director.root.pipeline as any;
//     let pipForward = director.root.pipeline as ForwardPipeline;
//     if (pipAny.globalDSManager.regenLayout) {
//         pipAny.globalDSManager.regenLayout();

//         pipAny._descriptorSet = pipAny.globalDSManager.globalDescriptorSet;
//         pipForward.pipelineUBO.activate(pipForward.device, pipForward);

//     }

//     // ubo
//     UBOCustomGlobalBuffer = getOrCreateBuffer(UBOCustomGlobal);
//     UBOCustomGlobalBuffer.update(UBOCustomGlobalBufferArray);

//     // texture
//     const black = builtinResMgr.get('black-texture') as Texture2D;
//     const white = builtinResMgr.get('white-texture') as Texture2D;
//     const defaultTex = builtinResMgr.get<Texture2D>('default-texture');

//     bindTexture(UNIFORM_SSAO_BINDING, black);
//     bindTexture(UNIFORM_SCENE_DEPTH_BINDING, white);
//     bindTexture(UNIFORM_SCENE_COLOR_BINDING, black);
//     bindTexture(UNIFORM_WATER_SDF_BINDING, black);
//     bindTexture(UNIFORM_GRASS_BINDING, black);


//     // 需要重新绑定 sampler
//     // 华为 p40 上必须绑定为 point filter
//     let sampler = pipForward.globalDSManager.linearSampler
//     if (sys.isMobile) {
//         sampler = pipForward.globalDSManager.pointSampler
//     }
//     pipForward.descriptorSet.bindSampler(pipeline.UNIFORM_SHADOWMAP_BINDING, sampler)
//     pipForward.descriptorSet.bindTexture(pipeline.UNIFORM_SHADOWMAP_BINDING, defaultTex.getGFXTexture())

//     // bindTexture(pipeline.UNIFORM_SHADOWMAP_BINDING, defaultTex);
// }

// game.on(Game.EVENT_GAME_INITED, () => {
//     resetUBO();
// });
