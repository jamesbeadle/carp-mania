import { DoubleSide, Mesh, MeshStandardMaterial, Vector2, type Texture } from 'three';
import type { SurveyedBank } from '../grass/coverGround';
import { CoverMipAlphaFragment } from '../grass/coverShader';
import { edited, including } from '../grass/shaderEdits';
import { coverQuality } from '../renderQuality';
import { bandRibbons } from './bandRibbons';
import { marginBandTexture } from './marginBandTexture';

const Fade = { FromMetres: 45, ToMetres: 95 } as const;
const Surface = { alphaTest: 0.45, side: DoubleSide, vertexColors: true, roughness: 0.95 } as const;
const FadeUniforms = 'uniform vec2 bandFade;\n';
const FadeFragment = 'diffuseColor.a *= smoothstep(bandFade.x, bandFade.y, length(vViewPosition));';

function bandMaterial(texture: Texture, reach: number) {
	const material = new MeshStandardMaterial({ ...Surface, map: texture });
	const bandFade = { value: new Vector2(Fade.FromMetres * reach, Fade.ToMetres * reach) };
	const edits = [including('map_fragment', CoverMipAlphaFragment + FadeFragment)];
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, { bandFade });
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
