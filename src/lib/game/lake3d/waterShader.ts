export const WaterVertexShader = `
uniform mat4 textureMatrix;
varying vec4 vReflectCoord;
varying vec3 vWorldPosition;
#include <fog_pars_vertex>
void main() {
	vec4 worldPosition = modelMatrix * vec4(position, 1.0);
	vWorldPosition = worldPosition.xyz;
	vReflectCoord = textureMatrix * vec4(position, 1.0);
	vec4 mvPosition = viewMatrix * worldPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <fog_vertex>
}`;

export const WaterFragmentShader = `
uniform sampler2D tDiffuse;
uniform vec3 color;
uniform float time;
uniform vec3 sunDirection;
uniform vec3 sunColour;
uniform vec3 deepColour;
uniform float clarity;
uniform float choppiness;
uniform float daylight;
varying vec4 vReflectCoord;
varying vec3 vWorldPosition;
#include <fog_pars_fragment>

vec2 wave(vec2 position, vec2 heading, float frequency, float speed) {
	float phase = dot(position, heading) * frequency + time * speed;
	return heading * cos(phase) * frequency;
}

vec3 rippledNormal(vec2 position, float distanceAway) {
	float calming = 1.0 / (1.0 + distanceAway / 45.0);
	vec2 slope = wave(position, normalize(vec2(1.0, 0.3)), 0.9, 1.1);
	slope += wave(position, normalize(vec2(-0.4, 1.0)), 1.7, 1.6) * 0.6;
	slope += wave(position, normalize(vec2(0.7, -0.8)), 3.3, 2.3) * 0.35;
	slope += wave(position, normalize(vec2(-0.9, -0.2)), 6.1, 3.1) * 0.2;
	return normalize(vec3(-slope.x * choppiness * calming, 1.0, -slope.y * choppiness * calming));
}

void main() {
	vec3 normal = rippledNormal(vWorldPosition.xz, distance(cameraPosition, vWorldPosition));
	vec3 toEye = normalize(cameraPosition - vWorldPosition);
	float facing = clamp(dot(normal, toEye), 0.0, 1.0);
	float fresnel = 0.08 + 0.92 * pow(1.0 - facing, 4.0);
	vec2 reflectUv = vReflectCoord.xy / vReflectCoord.w + normal.xz * 0.035;
	vec3 reflected = texture2D(tDiffuse, reflectUv).rgb;
	vec3 body = deepColour * (0.2 + 0.8 * daylight);
	vec3 surface = mix(body, reflected * 0.85, clamp(fresnel * 1.1, 0.0, 1.0));
	vec3 bounce = reflect(-sunDirection, normal);
	float glint = pow(max(dot(bounce, toEye), 0.0), 220.0) * step(0.0, sunDirection.y);
	surface += sunColour * glint * 2.4;
	float opacity = mix(1.0, 0.72, clarity * (1.0 - fresnel));
	gl_FragColor = vec4(surface * color, opacity);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`;
