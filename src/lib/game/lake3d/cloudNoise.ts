export const CloudNoise = `
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

float billows(vec2 point, float detail) {
	float total = 0.5 + 0.5 * noise(point) * 0.5;
	float amplitude = 0.25 * detail;
	point = mat2(1.6, 1.2, -1.2, 1.6) * point + vec2(7.3, 3.1);
	for (int octave = 1; octave < OCTAVES; octave++) {
		total += amplitude * (abs(noise(point)) - 0.35);
		point = mat2(1.6, 1.2, -1.2, 1.6) * point + vec2(7.3, 3.1);
		amplitude *= 0.5;
	}
	return total;
}
`;
