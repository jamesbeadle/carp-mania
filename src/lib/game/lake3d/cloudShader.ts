import { CloudNoise } from './cloudNoise';

export const CloudVertex = `
varying vec3 vDirection;
void main() {
	vDirection = position;
	vec4 placed = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	gl_Position = placed.xyww;
}`;

export const CloudFragment = `${CloudNoise}
uniform vec3 sunDirection;
uniform vec3 litColour;
uniform vec3 shadeColour;
uniform vec3 hazeColour;
uniform float cover;
uniform float heaviness;
uniform float veil;
uniform vec2 drift;
varying vec3 vDirection;

float detail = 1.0;

float heightAt(vec2 point) {
	float heaps = 0.5 + 0.5 * noise(point * 0.19 + vec2(4.1, 8.7));
	float threshold = 0.72 - 0.5 * cover - 0.3 * pow(cover, 4.0) + (0.5 - heaps) * 0.4 * (1.0 - cover);
	return billows(point, detail) - threshold;
}

float sunlightAt(vec2 point, float height) {
	vec2 sunward = normalize(sunDirection.xz + vec2(0.0001));
	float near = max(heightAt(point + sunward * 0.07), 0.0);
	float far = max(heightAt(point + sunward * 0.2), 0.0);
	return exp(-(near + far * 0.6 + height * 0.5) * 5.0);
}

vec4 cloudToward(vec3 direction, float rise) {
	detail = smoothstep(0.0, 0.25, rise);
	vec2 layerPoint = direction.xz / (rise + 0.1) * 1.7 + drift;
	float height = heightAt(layerPoint);
	if (height <= 0.0) return vec4(0.0);
	float thickness = smoothstep(0.0, 0.14 + heaviness * 0.3, height);
	float side = pow(1.0 - rise, 3.0);
	float underlit = pow(1.0 - clamp(sunDirection.y, 0.0, 1.0), 6.0);
	float light = exp(-thickness * 2.4) * 0.5 + sunlightAt(layerPoint, height) * 0.5;
	light = mix(light, 1.0, max(side * 0.5, underlit * 0.6));
	float mottle = clamp(0.5 + (height - 0.45) * 1.6, 0.0, 1.0) * 0.7;
	light = mix(light, mottle, heaviness * 0.7);
	vec3 colour = mix(shadeColour, litColour, light * (1.0 - heaviness * 0.5));
	float lining = pow(max(dot(direction, sunDirection), 0.0), 10.0) * (1.0 - thickness);
	colour += litColour * lining * 0.8;
	colour = mix(colour, hazeColour, (1.0 - smoothstep(0.02, 0.3, rise)) * 0.7);
	float alpha = smoothstep(0.0, 0.09 + heaviness * 0.15, height) * smoothstep(0.0, 0.05, rise);
	return vec4(colour, alpha);
}

void main() {
	vec3 direction = normalize(vDirection);
	float rise = direction.y;
	vec4 cloud = rise > 0.0 ? cloudToward(direction, rise) : vec4(0.0);
	float veiling = veil * (1.0 - 0.5 * smoothstep(0.0, 0.8, rise));
	float alpha = veiling + (1.0 - veiling) * cloud.a;
	if (alpha <= 0.002) discard;
	vec3 colour = (hazeColour * veiling + cloud.rgb * cloud.a * (1.0 - veiling)) / alpha;
	gl_FragColor = vec4(colour, alpha);
}`;
