import { MeshDepthMaterial, RGBADepthPacking, Vector3, type Texture } from 'three';
import { CoverAtlasVertex } from './coverShader';
import { edited, including } from './shaderEdits';

const CutOff = 0.45;
const Declarations = 'attribute vec3 coverPlant;\nuniform vec3 coverGrid;\n';

export function coverDepthMaterial(atlas: Texture, grid: { columns: number; rows: number; padding: number }) {
	const material = new MeshDepthMaterial({ depthPacking: RGBADepthPacking, map: atlas, alphaTest: CutOff });
	const coverGrid = { value: new Vector3(grid.columns, grid.rows, grid.padding) };
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, { coverGrid });
		shader.vertexShader = Declarations + edited(shader.vertexShader, [including('uv_vertex', CoverAtlasVertex)]);
	};
	material.customProgramCacheKey = () => 'cover-depth';
	return material;
}
