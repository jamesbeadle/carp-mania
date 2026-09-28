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
uniform vec3 shallowColour;
uniform float clarity;
uniform float choppiness;
uniform float daylight;
uniform sampler2D ripples;
uniform sampler2D depthMap;
uniform vec4 depthBounds;
varying vec4 vReflectCoord;
varying vec3 vWorldPosition;
#include <fog_pars_fragment>

vec3 rippleAt(vec2 position, float scale, vec2 drift) {
	vec3 texel = texture2D(ripples, position / scale + drift * time).rgb * 2.0 - 1.0;
	return vec3(texel.x, texel.z, texel.y);
}

vec3 rippledNormal(vec2 position, float distanceAway, float stillness) {
	float calming = stillness / (1.0 + distanceAway / 60.0);
	float nearness = 1.0 / (1.0 + distanceAway / 12.0);
	vec3 micro = rippleAt(position, 1.3, vec2(-0.03, 0.024)) * nearness * 1.6;
	vec3 fine = rippleAt(position, 3.5, vec2(0.021, 0.013));
	vec3 broad = rippleAt(position, 11.0, vec2(-0.009, 0.017));
	vec3 slope = (micro + fine + broad * 0.9) * choppiness * calming * 0.32;
	return normalize(vec3(slope.x, 1.0, slope.z));
}

float depthShareAt(vec2 position) {
	return texture2D(depthMap, (position - depthBounds.xy) / depthBounds.zw).r;
}

void main() {
	float depthShare = depthShareAt(vWorldPosition.xz);
	float shore = 1.0 - smoothstep(0.0, 0.07, depthShare);
	float distanceAway = distance(cameraPosition, vWorldPosition);
	vec3 normal = rippledNormal(vWorldPosition.xz, distanceAway, mix(0.3, 1.0, smoothstep(0.0, 0.3, depthShare)));
	vec3 toEye = normalize(cameraPosition - vWorldPosition);
	float facing = clamp(dot(normal, toEye), 0.0, 1.0);
	float fresnel = 0.03 + 0.97 * pow(1.0 - facing, 5.0);
	vec2 reflectUv = vReflectCoord.xy / vReflectCoord.w + normal.xz * 0.06;
	vec3 reflected = texture2D(tDiffuse, reflectUv).rgb * 0.72;
	vec3 body = mix(shallowColour, deepColour, smoothstep(0.02, 0.55, depthShare)) * (0.25 + 1.35 * daylight);
	vec3 surface = mix(body, reflected, clamp(fresnel * 1.15, 0.0, 1.0));
	vec3 bounce = reflect(-sunDirection, normal);
	float glint = pow(max(dot(bounce, toEye), 0.0), 260.0) * step(0.0, sunDirection.y);
	surface += sunColour * glint * 2.6;
	float lapping = shore * (0.6 + 0.4 * sin(time * 1.1 + dot(normal.xz, vec2(9.0, 7.0))));
	surface = mix(surface, sunColour * (0.25 + 0.5 * daylight), lapping * 0.14);
	float seeThrough = clarity * (1.0 - smoothstep(0.0, 0.5, depthShare)) * (1.0 - fresnel);
	float opacity = mix(1.0, 0.3, seeThrough) * smoothstep(0.0, 0.035, depthShare + 0.004);
	gl_FragColor = vec4(surface * color, opacity);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`;
