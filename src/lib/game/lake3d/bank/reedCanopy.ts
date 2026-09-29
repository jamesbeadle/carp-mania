import { DoubleSide, InstancedMesh, Matrix4, MeshStandardMaterial, PlaneGeometry, Quaternion, Vector2, Vector3 } from 'three';
import type { RandomFraction } from '$lib/domain/random';
import type { SeasonName } from '$lib/domain/world/worldClock';
import { edited, including } from '../grass/shaderEdits';
import { NearDetailLayer } from '../renderQuality';
import { reedCanopyTexture } from './reedCanopyTexture';
import type { ReedClump } from './reedClumps';

const Canopy = { TopMetres: 2.3, HeightShare: 0.82, Spread: 1.5, FadeFrom: 0.32, ShownAt: 0.6, CutOff: 0.5, Roughness: 0.9, Tint: '#9a9a9a' } as const;
const Up = new Vector3(0, 1, 0);
const VertexHead = 'varying float canopyAbove;\nuniform vec2 canopyFade;\n';
const FragmentHead = 'varying float canopyAbove;\n';
const AboveVertex = `
vec3 canopyRoot = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
canopyAbove = smoothstep(canopyFade.x, canopyFade.y, normalize(cameraPosition - canopyRoot).y);
`;
const AboveFragment = 'diffuseColor.a *= canopyAbove;';

function canopyMaterial(season: SeasonName) {
	const material = new MeshStandardMaterial({ map: reedCanopyTexture(season), color: Canopy.Tint, alphaTest: Canopy.CutOff, side: DoubleSide, roughness: Canopy.Roughness });
	const canopyFade = { value: new Vector2(Canopy.FadeFrom, Canopy.ShownAt) };
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, { canopyFade });
		shader.vertexShader = VertexHead + edited(shader.vertexShader, [including('project_vertex', AboveVertex)]);
		shader.fragmentShader = FragmentHead + edited(shader.fragmentShader, [including('map_fragment', AboveFragment)]);
	};
	material.customProgramCacheKey = () => 'reed-canopy';
	return material;
}

function placementOf(clump: ReedClump, random: RandomFraction) {
	const { centre } = clump;
	const height = Canopy.TopMetres * clump.height * Canopy.HeightShare;
	const size = clump.radius * Canopy.Spread;
	const turn = new Quaternion().setFromAxisAngle(Up, random() * Math.PI * 2);
	return new Matrix4().compose(new Vector3(centre.x, height, centre.z), turn, new Vector3(size, 1, size));
}

export function createReedCanopy(clumps: ReedClump[], season: SeasonName, random: RandomFraction) {
	const geometry = new PlaneGeometry(2, 2).rotateX(-Math.PI / 2);
	const mesh = new InstancedMesh(geometry, canopyMaterial(season), Math.max(1, clumps.length));
	mesh.count = clumps.length;
	clumps.forEach((clump, index) => mesh.setMatrixAt(index, placementOf(clump, random)));
	mesh.computeBoundingSphere();
	mesh.name = 'reed-canopy';
	mesh.layers.set(NearDetailLayer);
	return mesh;
}
