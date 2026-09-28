import { BackSide, Mesh, ShaderMaterial, SphereGeometry } from 'three';

const DomeRadius = 8000;

const NightVertex = `
varying vec3 vDirection;
void main() {
	vDirection = normalize(position);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NightFragment = `
uniform float darkness;
varying vec3 vDirection;
float hash(vec3 point) {
	return fract(sin(dot(point, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
void main() {
	float up = clamp(vDirection.y, 0.0, 1.0);
	vec3 horizon = vec3(0.045, 0.06, 0.11);
	vec3 zenith = vec3(0.004, 0.008, 0.024);
	vec3 colour = mix(horizon, zenith, pow(up, 0.55));
	vec3 cell = floor(vDirection * 420.0);
	float star = step(0.9975, hash(cell)) * smoothstep(0.05, 0.35, up);
	colour += vec3(star) * 0.9;
	gl_FragColor = vec4(colour, darkness);
}`;

export function createNightSky() {
	const material = new ShaderMaterial({ uniforms: { darkness: { value: 0 } }, vertexShader: NightVertex, fragmentShader: NightFragment, side: BackSide, transparent: true, depthWrite: false, fog: false });
	const dome = new Mesh(new SphereGeometry(DomeRadius, 32, 16), material);
	dome.renderOrder = 1;
	const { darkness } = material.uniforms;
	return { dome, darken: (daylight: number) => void (darkness.value = 1 - daylight) };
}
