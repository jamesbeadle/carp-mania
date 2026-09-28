import { WaterShoreChunk } from './waterShoreShader';

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
${WaterShoreChunk}

vec3 rippleAt(vec2 position, float scale, vec2 drift) {
	vec3 texel = texture2D(ripples, position / scale + drift * time).rgb * 2.0 - 1.0;
	return vec3(texel.x, texel.z, texel.y);
}

vec3 rippledNormal(vec2 position, float distanceAway, float calm) {
	float calming = calm / (1.0 + distanceAway / 60.0);
	vec3 fine = rippleAt(position, 3.5, vec2(0.021, 0.013));
	vec3 broad = rippleAt(position, 11.0, vec2(-0.009, 0.017));
	vec3 finest = rippleAt(position, 1.3, vec2(-0.031, -0.022)) * (1.0 - smoothstep(8.0, 40.0, distanceAway));
	vec3 slope = (fine + broad * 1.4 + finest * 0.45) * choppiness * calming;
	return normalize(vec3(slope.x, 1.0, slope.z));
}

void main() {
	ShoreSample shore = shoreAt(vWorldPosition.xz);
	float distanceAway = distance(cameraPosition, vWorldPosition);
	vec3 normal = rippledNormal(vWorldPosition.xz, distanceAway, shoreCalm(shore));
	vec3 toEye = normalize(cameraPosition - vWorldPosition);
	float facing = clamp(dot(normal, toEye), 0.0, 1.0);
	float fresnel = clamp((0.06 + 0.94 * pow(1.0 - facing, 4.0)) * 1.1, 0.0, 1.0);
	vec2 reflectUv = vReflectCoord.xy / vReflectCoord.w + normal.xz * 0.05;
	vec3 reflected = texture2D(tDiffuse, reflectUv).rgb * 0.85;
	WaterBody body = waterBodyAt(shore, clarity, 0.2 + 0.8 * daylight);
	vec3 bounce = reflect(-sunDirection, normal);
	float glint = pow(max(dot(bounce, toEye), 0.0), 220.0) * step(0.0, sunDirection.y);
	vec3 light = reflected * fresnel + sunColour * glint * 2.4;
	vec3 premultiplied = body.colour * body.opacity * (1.0 - fresnel) + light;
	float opacity = clamp(body.opacity * (1.0 - fresnel) + fresnel + glint, 0.0, 1.0);
	float foam = foamAt(vWorldPosition.xz, shore) * (0.35 + 0.65 * daylight) * (1.0 - smoothstep(FoamFadeNear, FoamFadeFar, distanceAway));
	premultiplied = mix(premultiplied, FoamColour * (0.25 + 0.75 * daylight), foam);
	opacity = mix(opacity, 1.0, foam);
	gl_FragColor = vec4(premultiplied * color / max(opacity, 0.001), opacity);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`;
