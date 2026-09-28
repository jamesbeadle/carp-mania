import { BackSide, MathUtils, Mesh, ShaderMaterial, SphereGeometry, Vector3 } from 'three';

const Dome = { Radius: 8000, WidthSegments: 32, HeightSegments: 16, RenderOrder: 1 } as const;
const DuskDaylight = 0.3;

const NightVertex = `
varying vec3 vDirection;
void main() {
	vDirection = normalize(position);
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const NightFragment = `
uniform float darkness;
uniform vec3 moonDirection;
varying vec3 vDirection;
float hash(vec3 point) {
	return fract(sin(dot(point, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}
void main() {
	vec3 direction = normalize(vDirection);
	float up = clamp(direction.y, 0.0, 1.0);
	vec3 horizon = vec3(0.05, 0.07, 0.13);
	vec3 zenith = vec3(0.005, 0.01, 0.03);
	vec3 colour = mix(horizon, zenith, pow(up, 0.5));
	vec3 cell = floor(direction * 420.0);
	float twinkle = hash(cell + 7.0);
	float star = step(0.9975, hash(cell)) * smoothstep(0.05, 0.35, up) * (0.4 + 0.6 * twinkle);
	colour += vec3(star) * 0.9 * smoothstep(0.75, 1.0, darkness);
	float moonward = max(dot(direction, moonDirection), 0.0);
	float disc = smoothstep(0.99990, 0.99994, moonward);
	colour += vec3(1.3, 1.35, 1.45) * disc + vec3(0.05, 0.07, 0.12) * pow(moonward, 180.0) + vec3(0.02, 0.03, 0.05) * pow(moonward, 12.0);
	gl_FragColor = vec4(colour, darkness);
}`;

export function createNightSky() {
	const uniforms = { darkness: { value: 0 }, moonDirection: { value: new Vector3(0, 1, 0) } };
	const material = new ShaderMaterial({ uniforms, vertexShader: NightVertex, fragmentShader: NightFragment, side: BackSide, transparent: true, depthWrite: false, fog: false });
	const dome = new Mesh(new SphereGeometry(Dome.Radius, Dome.WidthSegments, Dome.HeightSegments), material);
	dome.renderOrder = Dome.RenderOrder;
	const { darkness, moonDirection } = uniforms;
	const darken = (daylight: number, moonlightFrom: Vector3) => {
		darkness.value = 1 - MathUtils.smoothstep(daylight, 0, DuskDaylight);
		moonDirection.value.copy(moonlightFrom);
	};
	return { dome, darken };
}
