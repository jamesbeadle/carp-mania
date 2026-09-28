import { DoubleSide, MeshStandardMaterial, Vector3, Vector4, type Texture } from 'three';
import { CoverAtlasVertex, CoverFragmentUniforms, CoverMipAlphaFragment, CoverSheenFragment, CoverThinningVertex, CoverVertexUniforms, SameNormalBothSides } from './coverShader';
import { CoverProjectVertex, CoverWindUniforms, type CoverWind } from './coverWind';
import { Thinning } from './coverThinning';

export interface CoverLook {
	atlas: Texture;
	grid: { columns: number; rows: number; padding: number };
	wind: CoverWind;
	give: number;
	isThinned: boolean;
	isSmoothEdged: boolean;
	roughness: number;
	sheen: number;
}

const CutOff = 0.45;
const SheenReach = { Near: 12, Far: 110, Farthest: 0.6 } as const;

function vertexCode(look: CoverLook) {
	const thinning = look.isThinned ? CoverThinningVertex : '';
	return '#include <begin_vertex>\n' + thinning;
}

export function coverMaterial(look: CoverLook) {
	const material = new MeshStandardMaterial({ map: look.atlas, alphaTest: CutOff, side: DoubleSide, roughness: look.roughness, vertexColors: true, alphaToCoverage: look.isSmoothEdged });
	const { grid, wind } = look;
	const uniforms = {
		coverGive: { value: look.give },
		coverGrid: { value: new Vector3(grid.columns, grid.rows, grid.padding) },
		coverThinning: { value: new Vector4(Thinning.FullWithin, Thinning.GoneBeyond, Thinning.Curve, Thinning.Fade) },
		coverGrowth: { value: Thinning.Growth },
		coverSheen: { value: look.sheen },
		coverSheenReach: { value: new Vector3(SheenReach.Near, SheenReach.Far, SheenReach.Farthest) },
		coverTime: wind.time,
		coverGust: wind.gust
	};
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = CoverVertexUniforms + CoverWindUniforms + shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n' + CoverAtlasVertex).replace('#include <begin_vertex>', vertexCode(look)).replace('#include <project_vertex>', CoverProjectVertex);
		shader.fragmentShader = CoverFragmentUniforms + shader.fragmentShader.replace('#include <normal_fragment_begin>', SameNormalBothSides).replace('#include <map_fragment>', '#include <map_fragment>\n' + CoverMipAlphaFragment).replace('#include <lights_physical_fragment>', '#include <lights_physical_fragment>\n' + CoverSheenFragment);
	};
	material.customProgramCacheKey = () => `cover-${look.isThinned}`;
	return material;
}
