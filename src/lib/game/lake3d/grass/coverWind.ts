import { ShaderChunk } from 'three';

const Breeze = { Still: 0.06, PerWind: 0.42 } as const;
const ViewStep = 'mvPosition = modelViewMatrix * mvPosition;';

export const CoverWindUniforms = `
uniform float coverTime;
uniform float coverGust;
`;

const WindVertex = `
vec3 windRoot = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
float windHeight = max(0.0, mvPosition.y - windRoot.y);
float windWave = sin(dot(windRoot.xz, vec2(0.13, 0.08)) - coverTime * 1.9) * 0.5 + 0.5;
float windFlutter = sin(coverTime * 4.7 + windRoot.x * 1.7 + windRoot.z * 2.3) * 0.22;
float windBend = coverGust * coverGive * (0.3 + windWave * windWave + windFlutter) * windHeight * position.y;
mvPosition.x += windBend;
mvPosition.z += windBend * 0.4;
mvPosition.y -= abs(windBend) * 0.35;
`;

export const CoverProjectVertex = ShaderChunk.project_vertex.replace(ViewStep, WindVertex + ViewStep);

export class CoverWind {
	readonly time = { value: 0 };
	readonly gust = { value: Breeze.Still as number };

	blow(timeSeconds: number, windStrength: number) {
		this.time.value = timeSeconds;
		this.gust.value = Breeze.Still + windStrength * Breeze.PerWind;
	}
}
