import { DoubleSide, Mesh, MeshStandardMaterial, Vector2, Vector3, type Texture } from 'three';
import type { SurveyedBank } from '../grass/coverGround';
import { CoverMipAlphaFragment, SameNormalBothSides } from '../grass/coverShader';
import { edited, including, replacing } from '../grass/shaderEdits';
import { coverQuality } from '../renderQuality';
import { bandRibbons } from './bandRibbons';
import { marginBandTexture } from './marginBandTexture';

const Fade = { FromMetres: 45, ToMetres: 95 } as const;
const Growth = { FromMetres: 80, SpanMetres: 140, MostExtra: 1.1 } as const;
const Surface = { alphaTest: 0.45, side: DoubleSide, vertexColors: true, roughness: 0.95 } as const;
const FadeUniforms = 'uniform vec2 bandFade;\n';
const GrowthUniforms = 'attribute float bandRise;\nuniform vec3 bandGrowth;\n';
const GrowthVertex = `
float bandDistance = distance((modelMatrix * vec4(transformed, 1.0)).xyz, cameraPosition);
transformed.y += bandRise * clamp((bandDistance - bandGrowth.x) / bandGrowth.y, 0.0, bandGrowth.z);
`;
const FadeFragment = 'diffuseColor.a *= smoothstep(bandFade.x, bandFade.y, length(vViewPosition));';

function bandMaterial(texture: Texture, reach: number) {
	const material = new MeshStandardMaterial({ ...Surface, map: texture });
	const bandFade = { value: new Vector2(Fade.FromMetres * reach, Fade.ToMetres * reach) };
	const bandGrowth = { value: new Vector3(Growth.FromMetres * reach, Growth.SpanMetres, Growth.MostExtra) };
	const edits = [replacing('normal_fragment_begin', SameNormalBothSides), including('map_fragment', CoverMipAlphaFragment + FadeFragment)];
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, { bandFade, bandGrowth });
		shader.vertexShader = GrowthUniforms + edited(shader.vertexShader, [including('begin_vertex', GrowthVertex)]);
		shader.fragmentShader = FadeUniforms + edited(shader.fragmentShader, edits);
	};
	material.customProgramCacheKey = () => 'margin-band';
	return material;
}

export function createMarginBand(bank: SurveyedBank) {
	const cover = coverQuality();
	const mesh = new Mesh(bandRibbons(bank), bandMaterial(marginBandTexture(bank.season, cover.cellPixels), cover.reach));
	mesh.name = 'margin-band';
	mesh.receiveShadow = true;
	return mesh;
}
