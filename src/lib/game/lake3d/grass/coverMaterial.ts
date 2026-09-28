import { DoubleSide, MeshStandardMaterial, Vector3, Vector4, type Texture } from 'three';
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

const FragmentEdits: ShaderEdit[] = [
	replacing('normal_fragment_begin', Chunks.SameNormalBothSides),
	including('map_fragment', Chunks.CoverMipAlphaFragment),
	including('lights_physical_fragment', Chunks.CoverSheenFragment)
];

function vertexEdits(look: CoverLook): ShaderEdit[] {
	const thinning = look.isThinned ? Chunks.CoverThinningVertex : '';
	return [including('uv_vertex', Chunks.CoverAtlasVertex), including('begin_vertex', thinning), replacing('project_vertex', CoverProjectVertex)];
}

function coverUniforms(look: CoverLook) {
	const { grid, wind } = look;
	const reach = thinningReach();
	return {
		coverGive: { value: look.give },
		coverGrid: { value: new Vector3(grid.columns, grid.rows, grid.padding) },
		coverThinning: { value: new Vector4(reach.fullWithin, reach.goneBeyond, Thinning.Curve, Thinning.Fade) },
		coverGrowth: { value: Thinning.Growth },
		coverSheen: { value: look.sheen },
		coverSheenReach: { value: new Vector3(SheenReach.Near, SheenReach.Far, SheenReach.Farthest) },
		coverTime: wind.time,
		coverGust: wind.gust
	};
}

export function coverMaterial(atlas: Texture, grid: AtlasGrid, wind: CoverWind, finish: CoverFinish) {
	const look: CoverLook = { ...finish, atlas, grid, wind };
	const isSmoothEdged = renderQuality().multisamples > 0;
	const surface = { map: atlas, alphaTest: CutOff, side: DoubleSide, roughness: look.roughness, vertexColors: true };
	const material = new MeshStandardMaterial({ ...surface, alphaToCoverage: isSmoothEdged });
	const uniforms = coverUniforms(look);
	const vertexHead = Chunks.CoverVertexUniforms + CoverWindUniforms;
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = vertexHead + edited(shader.vertexShader, vertexEdits(look));
		shader.fragmentShader = Chunks.CoverFragmentUniforms + edited(shader.fragmentShader, FragmentEdits);
	};
	material.customProgramCacheKey = () => `cover-${look.isThinned}`;
	return material;
}
