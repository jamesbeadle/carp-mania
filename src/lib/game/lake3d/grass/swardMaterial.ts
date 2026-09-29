import { Vector3, type Color, type Texture, type Vector4 } from 'three';
import { coverSurface, FragmentEdits, sharedUniforms, type AtlasGrid } from './coverMaterial';
import { CoverFragmentUniforms } from './coverShader';
import { CoverWindUniforms, projectWithWind, type CoverWind } from './coverWind';
import { edited, including, replacing } from './shaderEdits';
import type { SwardField } from './swardField';
import { SwardPlacementVertex, SwardShapeVertex, SwardTintVertex, SwardVertexHead } from './swardShader';

interface SwardLook {
	atlas: Texture;
	grid: AtlasGrid;
	wind: CoverWind;
	field: SwardField;
	reach: Vector4;
	warmth: Color;
}

const Finish = { give: 1, roughness: 0.95, sheen: 0.12 } as const;

const VertexEdits = [
	including('uv_vertex', SwardPlacementVertex),
	including('color_vertex', SwardTintVertex),
	including('begin_vertex', SwardShapeVertex),
	replacing('project_vertex', projectWithWind('swardRoot'))
];

export function swardMaterial(look: SwardLook) {
	const { grid, field, warmth } = look;
	const material = coverSurface(look.atlas, Finish.roughness);
	const uniforms = {
		...sharedUniforms({ ...Finish, wind: look.wind }),
		coverGrid: { value: new Vector3(grid.columns, grid.rows, grid.padding) },
		swardField: { value: field.texture },
		swardArea: { value: field.area },
		swardReach: { value: look.reach },
		swardWarmth: { value: new Vector3(warmth.r, warmth.g, warmth.b) }
	};
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = SwardVertexHead + CoverWindUniforms + edited(shader.vertexShader, VertexEdits);
		shader.fragmentShader = CoverFragmentUniforms + edited(shader.fragmentShader, FragmentEdits);
	};
	material.customProgramCacheKey = () => 'cover-sward';
	return material;
}
