import { Color, MeshStandardMaterial, Vector3, Vector4, type WebGLProgramParametersWithUniforms } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { BedLooks, GrassPalettes, Waterside } from './groundPalette';
import { GroundReliefNormal } from './groundDetailShader';
import { GroundAlbedo, GroundFragmentDeclarations, GroundRoughness, GroundVertexDeclarations, GroundVertexPlacing } from './groundShader';
import { groundTilesFor } from './groundTiles';

export interface GroundLook {
	season: SeasonName;
	bed: BedType;
	tilePixels: number;
	wear: { paths: Vector4[]; count: number };
}

const ProgramKey = 'lake-ground';

function groundUniforms(look: GroundLook) {
	const tiles = groundTilesFor(look.season, look.bed, look.tilePixels);
	const palette = GrassPalettes[look.season];
	const { wear } = look;
	return {
		grassTile: { value: tiles.grass },
		earthTile: { value: tiles.earth },
		shingleTile: { value: tiles.shingle },
		bedTile: { value: tiles.bed },
		groundNoise: { value: tiles.noise },
		lushGrass: { value: new Vector3(...palette.lush) },
		dryGrass: { value: new Vector3(...palette.dry) },
		underwaterTint: { value: new Color(Waterside.underwater) },
		shingleShare: { value: BedLooks[look.bed].shingleShare },
		wetDarkening: { value: Waterside.wetDarkening },
		swimWear: { value: wear.paths },
		swimCount: { value: wear.count }
	};
}

function withGround(shader: WebGLProgramParametersWithUniforms, uniforms: ReturnType<typeof groundUniforms>) {
	Object.assign(shader.uniforms, uniforms);
	shader.vertexShader = shader.vertexShader
		.replace('#include <common>', `#include <common>\n${GroundVertexDeclarations}`)
		.replace('#include <begin_vertex>', `#include <begin_vertex>\n${GroundVertexPlacing}`);
	shader.fragmentShader = shader.fragmentShader
		.replace('#include <common>', `#include <common>\n${GroundFragmentDeclarations}`)
		.replace('#include <map_fragment>', GroundAlbedo)
		.replace('#include <roughnessmap_fragment>', GroundRoughness)
		.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${GroundReliefNormal}`);
}

export function createGroundMaterial(look: GroundLook) {
	const material = new MeshStandardMaterial({ roughness: 1 });
	const uniforms = groundUniforms(look);
	material.onBeforeCompile = (shader) => withGround(shader, uniforms);
	material.customProgramCacheKey = () => ProgramKey;
	return material;
}
