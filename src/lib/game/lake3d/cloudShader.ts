export const CloudVertex = `
varying vec3 vDirection;
void main() {
	vDirection = position;
	vec4 placed = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	gl_Position = placed.xyww;
}`;

export const CloudFragment = `
uniform vec3 sunDirection;
uniform vec3 litColour;
uniform vec3 shadeColour;
uniform vec3 hazeColour;
uniform float cover;
uniform float heaviness;
uniform vec2 drift;
varying vec3 vDirection;

vec2 gradient(vec2 cell) {
	vec3 scrambled = fract(cell.xyx * vec3(0.1031, 0.1030, 0.0973));
	scrambled += dot(scrambled, scrambled.yzx + 33.33);
	return fract((scrambled.xx + scrambled.yz) * scrambled.zy) * 2.0 - 1.0;
}

float noise(vec2 point) {
	vec2 whole = floor(point);
	vec2 part = fract(point);
	vec2 blend = part * part * part * (part * (part * 6.0 - 15.0) + 10.0);
	float a = dot(gradient(whole), part);
	float b = dot(gradient(whole + vec2(1.0, 0.0)), part - vec2(1.0, 0.0));
	float c = dot(gradient(whole + vec2(0.0, 1.0)), part - vec2(0.0, 1.0));
	float d = dot(gradient(whole + vec2(1.0, 1.0)), part - vec2(1.0, 1.0));
	return mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y) * 1.6;
}

float billows(vec2 point) {
	float total = 0.5 + 0.5 * noise(point) * 0.5;
	float amplitude = 0.25;
	point = mat2(1.6, 1.2, -1.2, 1.6) * point + vec2(7.3, 3.1);
	for (int octave = 1; octave < OCTAVES; octave++) {
		total += amplitude * (abs(noise(point)) - 0.35);
		point = mat2(1.6, 1.2, -1.2, 1.6) * point + vec2(7.3, 3.1);
		amplitude *= 0.5;
	}
	return total;
}

float heightAt(vec2 point) {
	float heaps = 0.5 + 0.5 * noise(point * 0.19 + vec2(4.1, 8.7));
	float threshold = mix(0.72, 0.22, cover) + (0.5 - heaps) * 0.4 * (1.0 - cover);
	return billows(point) - threshold;
}

float sunlightAt(vec2 point, float height) {
	vec2 sunward = normalize(sunDirection.xz + vec2(0.0001));
	float near = max(heightAt(point + sunward * 0.07), 0.0);
	float far = max(heightAt(point + sunward * 0.2), 0.0);
	return exp(-(near + far * 0.6 + height * 0.5) * 3.2);
}

void main() {
	vec3 direction = normalize(vDirection);
	float rise = direction.y;
	if (rise <= 0.0) discard;
	vec2 layerPoint = direction.xz / (rise + 0.1) * 1.7 + drift;
	float height = heightAt(layerPoint);
	if (height <= 0.0) discard;
	float thickness = clamp(height / (0.16 + heaviness * 0.3), 0.0, 1.0);
	float sunlight = sunlightAt(layerPoint, height);
	float side = pow(1.0 - rise, 3.0);
	float underlit = pow(1.0 - clamp(sunDirection.y, 0.0, 1.0), 6.0);
	float light = exp(-thickness * 1.8) * 0.45 + sunlight * 0.55;
	light = mix(light, 1.0, max(side * 0.5, underlit * 0.6));
	vec3 colour = mix(shadeColour, litColour, light * (1.0 - heaviness * 0.6));
	float lining = pow(max(dot(direction, sunDirection), 0.0), 10.0) * (1.0 - thickness);
	colour += litColour * lining * 0.8;
	float distanceHaze = 1.0 - smoothstep(0.02, 0.3, rise);
	colour = mix(colour, hazeColour, distanceHaze * 0.7);
	float alpha = smoothstep(0.0, 0.04 + heaviness * 0.15, height) * smoothstep(0.0, 0.05, rise);
	gl_FragColor = vec4(colour, alpha);
}`;
