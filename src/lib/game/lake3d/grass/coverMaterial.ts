import { DoubleSide, MeshStandardMaterial, Vector2, Vector3, Vector4, type Texture } from 'three';
import { renderQuality } from '../renderQuality';
import * as Chunks from './coverShader';
import { Thinning, thinningReach } from './coverThinning';
import { CoverProjectVertex, CoverWindUniforms, type CoverWind } from './coverWind';
import { edited, including, replacing, type ShaderEdit } from './shaderEdits';

export interface AtlasGrid {
	columns: number;
	rows: number;
	padding: number;
}

export interface CoverFinish {
	give: number;
	isThinned: boolean;
	isFadedFromAbove?: boolean;
	isFacingCamera?: boolean;
	roughness: number;
	sheen: number;
}

interface CoverLook extends CoverFinish {
	atlas: Texture;
	grid: AtlasGrid;
	wind: CoverWind;
}

const CutOff = 0.45;
const SheenReach = { Near: 12, Far: 110, Farthest: 0.6 } as const;
const SeenFromAbove = { FadeFrom: 0.62, GoneAt: 0.88 } as const;
const FacingJitter = 2.1;

export const FragmentEdits: ShaderEdit[] = [
	replacing('normal_fragment_begin', Chunks.SameNormalBothSides),
	including('map_fragment', Chunks.CoverMipAlphaFragment),
	including('lights_physical_fragment', Chunks.CoverSheenFragment)
];

function vertexEdits(look: CoverLook): ShaderEdit[] {
	const thinning = look.isThinned ? Chunks.CoverThinningVertex : '';
	const fromAbove = look.isFadedFromAbove ? Chunks.CoverFromAboveVertex : '';
	const facing = look.isFacingCamera ? Chunks.CoverFacingVertex : '';
	return [including('uv_vertex', Chunks.CoverAtlasVertex), including('begin_vertex', facing + thinning + fromAbove), replacing('project_vertex', CoverProjectVertex)];
}

function coverUniforms(look: CoverLook) {
	const { grid } = look;
	const reach = thinningReach();
	return {
		coverGrid: { value: new Vector3(grid.columns, grid.rows, grid.padding) },
		coverThinning: { value: new Vector4(reach.fullWithin, reach.goneBeyond, Thinning.Curve, Thinning.Fade) },
		coverGrowth: { value: Thinning.Growth },
		...sharedUniforms(look)
	};
}

export function sharedUniforms(look: { give: number; sheen: number; wind: CoverWind }) {
	const { wind } = look;
	return {
		coverGive: { value: look.give },
		coverAbove: { value: new Vector2(SeenFromAbove.FadeFrom, SeenFromAbove.GoneAt) },
		coverFacing: { value: FacingJitter },
		coverSheen: { value: look.sheen },
		coverSheenReach: { value: new Vector3(SheenReach.Near, SheenReach.Far, SheenReach.Farthest) },
		coverTime: wind.time,
		coverGust: wind.gust
	};
}

export function coverSurface(atlas: Texture, roughness: number) {
	const isSmoothEdged = renderQuality().multisamples > 0;
	return new MeshStandardMaterial({ map: atlas, alphaTest: CutOff, side: DoubleSide, roughness, vertexColors: true, alphaToCoverage: isSmoothEdged });
}

export function coverMaterial(atlas: Texture, grid: AtlasGrid, wind: CoverWind, finish: CoverFinish) {
	const look: CoverLook = { ...finish, atlas, grid, wind };
	const material = coverSurface(atlas, look.roughness);
	const uniforms = coverUniforms(look);
	const vertexHead = Chunks.CoverVertexUniforms + CoverWindUniforms;
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = vertexHead + edited(shader.vertexShader, vertexEdits(look));
		shader.fragmentShader = Chunks.CoverFragmentUniforms + edited(shader.fragmentShader, FragmentEdits);
	};
	material.customProgramCacheKey = () => `cover-${look.isThinned}-${look.isFadedFromAbove === true}-${look.isFacingCamera === true}`;
	return material;
}
