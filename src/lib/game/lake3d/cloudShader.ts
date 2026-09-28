import { CloudNoise } from './cloudNoise';
import { CoverThreshold } from './cloudCover';
import { glslFloat as f } from './glslNumber';

const Heaps = { Scale: 0.14, Weight: 0.6 } as const;
const Layer = { Scale: 1.7, HorizonLift: 0.1, DetailRise: 0.25 } as const;
const Sunward = { Near: 0.07, Far: 0.2, FarWeight: 0.6, HeightWeight: 0.5, Absorption: 5 } as const;
const Body = { Thickening: 0.14, HeavyThickening: 0.3, Density: 2.4, EdgeSoftness: 0.14, HeavyEdgeSoftness: 0.15 } as const;
const Horizon = { SideLight: 0.5, UnderLight: 0.6, HazeFrom: 0.02, HazeTo: 0.3, HazeShare: 0.7, FadeRise: 0.05 } as const;
const Overcast = { RollScale: 1.1, RollDepth: 0.55, MottleShare: 0.7, LitShare: 0.5, UndersideDarkening: 0.3 } as const;
const Lining = { Sharpness: 10, Strength: 0.8 } as const;
const Reflection = { Fade: 0.35, ZenithFade: 0.4, ZenithFrom: 0.3, ZenithTo: 0.9 } as const;
const Veiling = { ZenithClearing: 0.5, ClearingRise: 0.8 } as const;

export const CloudVertex = `
varying vec3 vDirection;
void main() {
	vDirection = position;
	vec4 placed = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	gl_Position = placed.xyww;
}`;

const CloudShape = `${CloudNoise}${CoverThreshold}
uniform vec3 sunDirection;
uniform float cover;
uniform float heaviness;
uniform vec2 drift;
float detail = 1.0;

float heightAt(vec2 point) {
	float heaps = 0.5 + 0.5 * noise(point * ${f(Heaps.Scale)} + vec2(4.1, 8.7));
	float threshold = coverThreshold(cover) + (0.5 - heaps) * ${f(Heaps.Weight)} * (1.0 - cover);
	return billows(point, detail) - threshold;
}

float sunlightAt(vec2 point, float height) {
	vec2 sunward = normalize(sunDirection.xz + vec2(0.0001));
	float near = max(heightAt(point + sunward * ${f(Sunward.Near)}), 0.0);
	float far = max(heightAt(point + sunward * ${f(Sunward.Far)}), 0.0);
	return exp(-(near + far * ${f(Sunward.FarWeight)} + height * ${f(Sunward.HeightWeight)}) * ${f(Sunward.Absorption)});
}

float overcastLight(float light, float height) {
	float mottle = clamp(0.5 + (height - 0.45) * 1.6, 0.0, 1.0) * ${f(Overcast.MottleShare)};
	return mix(light, mottle, heaviness * ${f(Overcast.MottleShare)});
}

float overcastRolls(vec2 point, float side) {
	float rolls = noise(point * ${f(Overcast.RollScale)} + vec2(2.3, 5.9));
	return (1.0 + heaviness * ${f(Overcast.RollDepth)} * rolls) * (1.0 - heaviness * side * ${f(Overcast.UndersideDarkening)});
}`;

export const CloudFragment = `${CloudShape}
uniform vec3 litColour;
uniform vec3 shadeColour;
uniform vec3 hazeColour;
uniform float veil;
uniform float reflected;
varying vec3 vDirection;

vec4 cloudToward(vec3 direction, float rise) {
	detail = smoothstep(0.0, ${f(Layer.DetailRise)}, rise);
	vec2 layerPoint = direction.xz / (rise + ${f(Layer.HorizonLift)}) * ${f(Layer.Scale)} + drift;
	float height = heightAt(layerPoint);
	if (height <= 0.0) return vec4(0.0);
	float thickness = smoothstep(0.0, ${f(Body.Thickening)} + heaviness * ${f(Body.HeavyThickening)}, height);
	float side = pow(1.0 - rise, 3.0);
	float underlit = pow(1.0 - clamp(sunDirection.y, 0.0, 1.0), 6.0);
	float light = exp(-thickness * ${f(Body.Density)}) * 0.5 + sunlightAt(layerPoint, height) * 0.5;
	light = mix(light, 1.0, max(side * ${f(Horizon.SideLight)}, underlit * ${f(Horizon.UnderLight)}));
	light = overcastLight(light, height);
	vec3 colour = mix(shadeColour, litColour, light * (1.0 - heaviness * ${f(Overcast.LitShare)}));
	float lining = pow(max(dot(direction, sunDirection), 0.0), ${f(Lining.Sharpness)}) * (1.0 - thickness);
	colour += litColour * lining * ${f(Lining.Strength)};
	colour *= overcastRolls(layerPoint, side);
	colour = mix(colour, hazeColour, (1.0 - smoothstep(${f(Horizon.HazeFrom)}, ${f(Horizon.HazeTo)}, rise)) * ${f(Horizon.HazeShare)});
	float softness = ${f(Body.EdgeSoftness)} + heaviness * ${f(Body.HeavyEdgeSoftness)};
	float alpha = smoothstep(0.0, softness, height) * smoothstep(0.0, ${f(Horizon.FadeRise)}, rise);
	return vec4(colour, alpha);
}

void main() {
	vec3 direction = normalize(vDirection);
	float rise = direction.y;
	vec4 cloud = rise > 0.0 ? cloudToward(direction, rise) : vec4(0.0);
	cloud.a *= 1.0 - reflected * (${f(Reflection.Fade)} + ${f(Reflection.ZenithFade)} * smoothstep(${f(Reflection.ZenithFrom)}, ${f(Reflection.ZenithTo)}, rise));
	float veiling = veil * (1.0 - ${f(Veiling.ZenithClearing)} * smoothstep(0.0, ${f(Veiling.ClearingRise)}, rise));
	float alpha = veiling + (1.0 - veiling) * cloud.a;
	if (alpha <= 0.002) discard;
	vec3 colour = (hazeColour * veiling + cloud.rgb * cloud.a * (1.0 - veiling)) / alpha;
	gl_FragColor = vec4(colour, alpha);
}`;
