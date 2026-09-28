import { MeshStandardMaterial, Vector3, type Texture, type WebGLProgramParametersWithUniforms } from 'three';
import type { CrownSway } from './crownSway';

const BarkVertex = `
#include <uv_vertex>
vBarkStyle = barkStyle;
`;

const BarkFragment = `
#include <color_fragment>
vec3 barkTexel = texture2D(bumpMap, vBumpMapUv).rgb;
diffuseColor.rgb *= dot(barkTexel * barkGains, vBarkStyle);
`;

const BarkSheen = `
#include <lights_fragment_end>
reflectedLight.indirectSpecular *= barkSheen;
`;

const Bark = { Roughness: 0.95, BumpScale: 2.2, Sheen: 0.35 } as const;
const ChannelGains = new Vector3(1.35, 1, 1.5);

function patchBarkShader(shader: WebGLProgramParametersWithUniforms) {
	Object.assign(shader.uniforms, { barkGains: { value: ChannelGains }, barkSheen: { value: Bark.Sheen } });
	shader.vertexShader = ('attribute vec3 barkStyle;\nvarying vec3 vBarkStyle;\n' + shader.vertexShader).replace('#include <uv_vertex>', BarkVertex);
	shader.fragmentShader = ('uniform vec3 barkGains;\nuniform float barkSheen;\nvarying vec3 vBarkStyle;\n' + shader.fragmentShader).replace('#include <color_fragment>', BarkFragment).replace('#include <lights_fragment_end>', BarkSheen);
}

export function barkMaterial(bark: Texture, sway: CrownSway) {
	const material = new MeshStandardMaterial({ vertexColors: true, roughness: Bark.Roughness, bumpMap: bark, bumpScale: Bark.BumpScale });
	material.onBeforeCompile = (shader) => {
		sway.attach(shader, false);
		patchBarkShader(shader);
	};
	return material;
}
