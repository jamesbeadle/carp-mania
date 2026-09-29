import { WaterRippleChunk } from './waterRippleShader';
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
varying vec4 vReflectCoord;
varying vec3 vWorldPosition;
#include <fog_pars_fragment>
${WaterRippleChunk}
${WaterShoreChunk}

const float MostReflection = 0.62;
const vec3 ReflectionTint = vec3(0.74, 0.84, 0.72);
const float BodyInReflection = 0.3;
const float ReflectionSaturation = 0.72;
const vec3 ReflectionLuminance = vec3(0.3, 0.59, 0.11);
const float FacingReflection = 0.02;
const float FresnelPower = 5.0;
const float ReflectionBend = 0.05;
const vec2 BodyLighting = vec2(0.2, 0.8);
const float GlintSharpness = 220.0;
const float GlintStrength = 1.2;
const vec2 FoamByDay = vec2(0.35, 0.65);
const vec2 FoamLightByDay = vec2(0.25, 0.75);

void main() {
	ShoreSample shore = shoreAt(vWorldPosition.xz);
	float distanceAway = distance(cameraPosition, vWorldPosition);
	vec3 normal = rippledNormal(vWorldPosition.xz, distanceAway, shoreCalm(shore));
	vec3 toEye = normalize(cameraPosition - vWorldPosition);
	float facing = clamp(dot(normal, toEye), 0.0, 1.0);
	float fresnel = min(MostReflection, FacingReflection + (1.0 - FacingReflection) * pow(1.0 - facing, FresnelPower));
	vec2 reflectUv = vReflectCoord.xy / vReflectCoord.w + normal.xz * ReflectionBend;
	WaterBody body = waterBodyAt(shore, vWorldPosition.xz, clarity, BodyLighting.x + BodyLighting.y * daylight);
	vec3 mirrored = texture2D(tDiffuse, reflectUv).rgb;
	mirrored = mix(vec3(dot(mirrored, ReflectionLuminance)), mirrored, ReflectionSaturation) * ReflectionTint;
	vec3 reflected = mix(mirrored, body.colour, BodyInReflection);
	vec3 bounce = reflect(-sunDirection, normal);
	float glint = pow(max(dot(bounce, toEye), 0.0), GlintSharpness) * step(0.0, sunDirection.y);
	vec3 light = reflected * fresnel + sunColour * glint * GlintStrength;
	vec3 premultiplied = body.colour * body.opacity * (1.0 - fresnel) + light;
	float opacity = clamp(body.opacity * (1.0 - fresnel) + fresnel + glint, 0.0, 1.0);
	float foam = foamAt(vWorldPosition.xz, shore) * (FoamByDay.x + FoamByDay.y * daylight) * (1.0 - smoothstep(FoamFadeNear, FoamFadeFar, distanceAway));
	premultiplied = mix(premultiplied, FoamColour * (FoamLightByDay.x + FoamLightByDay.y * daylight), foam);
	opacity = mix(opacity, 1.0, foam);
	gl_FragColor = vec4(premultiplied * color / max(opacity, 0.001), opacity);
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`;
