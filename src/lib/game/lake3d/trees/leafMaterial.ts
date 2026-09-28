import { Color, DoubleSide, MeshDepthMaterial, MeshStandardMaterial, RGBADepthPacking, ShaderChunk, type Texture, type WebGLProgramParametersWithUniforms } from 'three';
import type { CrownSway } from './crownSway';
import { BiasedLeafTexture, EveryLeafKept, HazyAlphaTest, LeafBillboard, LeafFragmentDeclarations, LeafFullness, LeafVertexDeclarations, SoftSheen, Translucency } from './leafShader';

const Leaf = { Roughness: 1, CutOff: 0.5, GlowSpread: 0.35, GlowFocus: 3, GlowStrength: 0.9, Sheen: 0.25, ShadowCutOff: 0.3, AliasedMipBias: 0.5 } as const;
const GlowTint = new Color(1.1, 1.0, 0.55);

function leafUniforms(mipBias: number) {
	return {
		leafMipBias: { value: mipBias },
		leafGlowSpread: { value: Leaf.GlowSpread },
		leafGlowFocus: { value: Leaf.GlowFocus },
		leafGlowStrength: { value: Leaf.GlowStrength },
		leafSheen: { value: Leaf.Sheen },
		leafGlowTint: { value: GlowTint }
	};
}

function patchLeafShader(shader: WebGLProgramParametersWithUniforms, mipBias: number) {
	Object.assign(shader.uniforms, leafUniforms(mipBias));
	const frontFacing = ShaderChunk.normal_fragment_begin.replace('gl_FrontFacing ? 1.0 : - 1.0', '1.0');
	shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\n' + LeafVertexDeclarations).replace('#include <color_vertex>', LeafFullness).replace('#include <project_vertex>', LeafBillboard);
	shader.fragmentShader = (LeafFragmentDeclarations + shader.fragmentShader)
		.replace('#include <map_fragment>', BiasedLeafTexture)
		.replace('#include <alphatest_fragment>', HazyAlphaTest)
		.replace('#include <normal_fragment_begin>', frontFacing)
		.replace('#include <lights_fragment_end>', SoftSheen)
		.replace('#include <opaque_fragment>', Translucency);
}

export function leafMaterial(atlas: Texture, sway: CrownSway, isMultisampled: boolean) {
	const material = new MeshStandardMaterial({ map: atlas, vertexColors: true, side: DoubleSide, roughness: Leaf.Roughness, alphaTest: Leaf.CutOff, alphaToCoverage: isMultisampled });
	material.onBeforeCompile = (shader) => {
		sway.attach(shader, true);
		patchLeafShader(shader, isMultisampled ? 0 : Leaf.AliasedMipBias);
	};
	return material;
}

export function leafShadowMaterial(atlas: Texture) {
	const material = new MeshDepthMaterial({ depthPacking: RGBADepthPacking, map: atlas, alphaTest: Leaf.ShadowCutOff, side: DoubleSide });
	material.onBeforeCompile = (shader) => {
		shader.vertexShader = (LeafVertexDeclarations + shader.vertexShader).replace('#include <begin_vertex>', EveryLeafKept).replace('#include <project_vertex>', LeafBillboard);
	};
	return material;
}
