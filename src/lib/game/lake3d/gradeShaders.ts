const PassThroughVertex = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const GradeShader = {
	name: 'LakeGrade',
	uniforms: { tDiffuse: { value: null }, warmth: { value: 0.035 }, saturation: { value: 1.1 }, lift: { value: 0.012 } },
	vertexShader: PassThroughVertex,
	fragmentShader: `
uniform sampler2D tDiffuse;
uniform float warmth;
uniform float saturation;
uniform float lift;
varying vec2 vUv;
void main() {
	vec4 texel = texture2D(tDiffuse, vUv);
	vec3 colour = texel.rgb + lift;
	float grey = dot(colour, vec3(0.2126, 0.7152, 0.0722));
	colour = mix(vec3(grey), colour, saturation);
	colour *= vec3(1.0 + warmth, 1.0, 1.0 - warmth);
	gl_FragColor = vec4(colour, texel.a);
}`
};

export const VignetteShader = {
	name: 'LakeVignette',
	uniforms: { tDiffuse: { value: null }, darkness: { value: 0.32 }, reach: { value: 0.78 } },
	vertexShader: PassThroughVertex,
	fragmentShader: `
uniform sampler2D tDiffuse;
uniform float darkness;
uniform float reach;
varying vec2 vUv;
void main() {
	vec4 texel = texture2D(tDiffuse, vUv);
	float fromCentre = distance(vUv, vec2(0.5)) * 1.41421;
	float shade = 1.0 - darkness * smoothstep(reach * 0.5, reach + 0.3, fromCentre);
	gl_FragColor = vec4(texel.rgb * shade, texel.a);
}`
};
