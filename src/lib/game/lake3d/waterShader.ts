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
uniform sampler2D ripples;
varying vec4 vReflectCoord;
varying vec3 vWorldPosition;
#include <fog_pars_fragment>

vec3 rippleAt(vec2 position, float scale, vec2 drift) {
	vec3 texel = texture2D(ripples, position / scale + drift * time).rgb * 2.0 - 1.0;
	return vec3(texel.x, texel.z, texel.y);
}

vec3 rippledNormal(vec2 position, float distanceAway) {
	float calming = 1.0 / (1.0 + distanceAway / 60.0);
	vec3 fine = rippleAt(position, 3.5, vec2(0.021, 0.013));
	vec3 broad = rippleAt(position, 11.0, vec2(-0.009, 0.017));
	vec3 slope = (fine + broad * 1.4) * choppiness * calming;
	return normalize(vec3(slope.x, 1.0, slope.z));
}

void main() {
	vec3 normal = rippledNormal(vWorldPosition.xz, distance(cameraPosition, vWorldPosition));
	vec3 toEye = normalize(cameraPosition - vWorldPosition);
	float facing = clamp(dot(normal, toEye), 0.0, 1.0);
	float fresnel = 0.08 + 0.92 * pow(1.0 - facing, 4.0);
	vec2 reflectUv = vReflectCoord.xy / vReflectCoord.w + normal.xz * 0.05;
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
