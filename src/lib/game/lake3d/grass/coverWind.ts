import { ShaderChunk } from 'three';
import { glslNumber as n } from './glslNumber';

const Breeze = { Still: 0.06, PerWind: 0.42 } as const;
const Wave = { Across: 0.13, Down: 0.08, Speed: 1.9 } as const;
const Flutter = { Speed: 4.7, Across: 1.7, Down: 2.3, Strength: 0.22 } as const;
const Bend = { Resting: 0.3, Sideways: 0.4, Droop: 0.35 } as const;
const ViewStep = 'mvPosition = modelViewMatrix * mvPosition;';
export const InstanceRoot = '(instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz';

export const CoverWindUniforms = `
uniform float coverTime;
uniform float coverGust;
`;

function windVertex(rootExpression: string) {
	return `
vec3 windRoot = ${rootExpression};
float windHeight = max(0.0, mvPosition.y - windRoot.y);
float windWave = sin(dot(windRoot.xz, vec2(${n(Wave.Across)}, ${n(Wave.Down)})) - coverTime * ${n(Wave.Speed)}) * 0.5 + 0.5;
float windFlutter = sin(coverTime * ${n(Flutter.Speed)} + windRoot.x * ${n(Flutter.Across)} + windRoot.z * ${n(Flutter.Down)}) * ${n(Flutter.Strength)};
float windBend = coverGust * coverGive * (${n(Bend.Resting)} + windWave * windWave + windFlutter) * windHeight * position.y;
mvPosition.x += windBend;
mvPosition.z += windBend * ${n(Bend.Sideways)};
mvPosition.y -= abs(windBend) * ${n(Bend.Droop)};
`;
}

export function projectWithWind(rootExpression: string) {
	return ShaderChunk.project_vertex.replace(ViewStep, windVertex(rootExpression) + ViewStep);
}

export const CoverProjectVertex = projectWithWind(InstanceRoot);

export class CoverWind {
	readonly time = { value: 0 };
	readonly gust = { value: Breeze.Still as number };

	blow(timeSeconds: number, windStrength: number) {
		this.time.value = timeSeconds;
		this.gust.value = Breeze.Still + windStrength * Breeze.PerWind;
	}
}
