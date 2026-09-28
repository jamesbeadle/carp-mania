import { Color, MeshStandardMaterial, Vector3, type WebGLProgramParametersWithUniforms } from 'three';
import type { BedType } from '$lib/domain/types';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { renderQuality } from '../renderQuality';
import { causticTile } from './causticTile';
import { BedLooks, GrassPalettes, Waterside } from './groundPalette';
import { GroundReliefNormal } from './groundDetailShader';
import { GroundAlbedo, GroundFragmentDeclarations, GroundRoughness, GroundShine, GroundVertexDeclarations, GroundVertexPlacing } from './groundShader';
import { groundTilesFor } from './groundTiles';
import type { ShoreMap } from './shoreMap';

export interface GroundLook {
	season: SeasonName;
	bed: BedType;
	shore: ShoreMap;
	clock: { value: number };
}

const ProgramKeys = { Detailed: 'lake-ground-detailed', Lite: 'lake-ground-lite' } as const;
const LiteDefine = '#define GROUND_LITE\n';

function groundUniforms(look: GroundLook, lift: number) {
	const tiles = groundTilesFor(look.season, look.bed, renderQuality().groundTilePixels);
	const palette = GrassPalettes[look.season];
	const { shore } = look;
	return {
		grassTile: { value: tiles.grass },
		earthTile: { value: tiles.earth },
		shingleTile: { value: tiles.shingle },
		bedTile: { value: tiles.bed },
		groundNoise: { value: tiles.noise },
		causticTile: { value: causticTile() },
		shoreMap: { value: shore.texture },
		shoreOrigin: { value: shore.origin },
		shoreSize: { value: shore.size },
		lushGrass: { value: new Vector3(...palette.lush) },
		dryGrass: { value: new Vector3(...palette.dry) },
		underwaterTint: { value: new Color(Waterside.underwater) },
		shingleShare: { value: BedLooks[look.bed].shingleShare },
		wetDarkening: { value: Waterside.wetDarkening },
		groundTime: look.clock,
		groundLift: { value: lift }
	};
}

function withGround(shader: WebGLProgramParametersWithUniforms, uniforms: ReturnType<typeof groundUniforms>, isDetailed: boolean) {
	Object.assign(shader.uniforms, uniforms);
	shader.vertexShader = shader.vertexShader
		.replace('#include <common>', `#include <common>\n${GroundVertexDeclarations}`)
		.replace('#include <begin_vertex>', `#include <begin_vertex>\n${GroundVertexPlacing}`);
	const fragment = shader.fragmentShader
		.replace('#include <common>', `#include <common>\n${GroundFragmentDeclarations}`)
		.replace('#include <map_fragment>', GroundAlbedo)
		.replace('#include <roughnessmap_fragment>', GroundRoughness)
		.replace('#include <lights_physical_fragment>', GroundShine)
		.replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>\n${GroundReliefNormal}`);
	shader.fragmentShader = isDetailed ? fragment : LiteDefine + fragment;
}

export function createGroundMaterial(look: GroundLook, lift = 0) {
	const material = new MeshStandardMaterial({ roughness: 1 });
	const uniforms = groundUniforms(look, lift);
	const { hasDetailedGround } = renderQuality();
	material.onBeforeCompile = (shader) => withGround(shader, uniforms, hasDetailedGround);
	material.customProgramCacheKey = () => (hasDetailedGround ? ProgramKeys.Detailed : ProgramKeys.Lite);
	return material;
}
