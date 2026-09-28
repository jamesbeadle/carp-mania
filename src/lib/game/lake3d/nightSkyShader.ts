import { glslFloat as f } from './glslNumber';

const Stars = { Cells: 420, Rarity: 0.9975, Brightness: 0.9, RiseFrom: 0.05, RiseTo: 0.35, ShowFrom: 0.75 } as const;
const Moon = { DiscFrom: 0.9999, DiscTo: 0.99994, HaloSharpness: 180, GlowSharpness: 12 } as const;
const Afterglow = { BandSharpness: 3, BandLowness: 4, ZenithCurve: 0.5 } as const;

export const NightVertex = `
varying vec3 vDirection;
void main() {
	vDirection = normalize(position);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const NightFragment = `
uniform float darkness;
uniform float afterglow;
uniform vec3 moonDirection;
uniform vec3 sunDirection;
varying vec3 vDirection;
float hash(vec3 point) {
	return fract(sin(dot(point, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
vec3 skyColour(vec3 direction, float up) {
	vec3 night = mix(vec3(0.05, 0.07, 0.13), vec3(0.005, 0.01, 0.03), pow(up, ${f(Afterglow.ZenithCurve)}));
	vec3 dusk = mix(vec3(0.16, 0.17, 0.27), vec3(0.03, 0.06, 0.17), pow(up, ${f(Afterglow.ZenithCurve)}));
	vec2 flatSun = normalize(sunDirection.xz + vec2(0.0001));
	float sunward = max(dot(normalize(direction.xz + vec2(0.0001)), flatSun), 0.0);
	float band = pow(sunward, ${f(Afterglow.BandSharpness)}) * pow(1.0 - up, ${f(Afterglow.BandLowness)});
	dusk += vec3(0.42, 0.2, 0.08) * band;
	return mix(night, dusk, afterglow);
}
void main() {
	vec3 direction = normalize(vDirection);
	float up = clamp(direction.y, 0.0, 1.0);
	vec3 colour = skyColour(direction, up);
	vec3 cell = floor(direction * ${f(Stars.Cells)});
	float twinkle = hash(cell + 7.0);
	float star = step(${f(Stars.Rarity)}, hash(cell)) * smoothstep(${f(Stars.RiseFrom)}, ${f(Stars.RiseTo)}, up) * (0.4 + 0.6 * twinkle);
	colour += vec3(star) * ${f(Stars.Brightness)} * smoothstep(${f(Stars.ShowFrom)}, 1.0, darkness);
	float moonward = max(dot(direction, moonDirection), 0.0);
	float disc = smoothstep(${f(Moon.DiscFrom)}, ${f(Moon.DiscTo)}, moonward);
	vec3 moonlight = vec3(0.05, 0.07, 0.12) * pow(moonward, ${f(Moon.HaloSharpness)}) + vec3(0.02, 0.03, 0.05) * pow(moonward, ${f(Moon.GlowSharpness)});
	colour += (vec3(1.3, 1.35, 1.45) * disc + moonlight) * (1.0 - afterglow);
	gl_FragColor = vec4(colour, darkness);
}`;
