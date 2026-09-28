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

const float MostReflection = 0.7;
const vec3 ReflectionTint = vec3(0.78, 0.87, 0.76);
const float BodyInReflection = 0.28;

void main() {
	ShoreSample shore = shoreAt(vWorldPosition.xz);
	float distanceAway = distance(cameraPosition, vWorldPosition);
	vec3 normal = rippledNormal(vWorldPosition.xz, distanceAway, shoreCalm(shore));
	vec3 toEye = normalize(cameraPosition - vWorldPosition);
	float facing = clamp(dot(normal, toEye), 0.0, 1.0);
	float fresnel = min(MostReflection, 0.02 + 0.98 * pow(1.0 - facing, 5.0));
	vec2 reflectUv = vReflectCoord.xy / vReflectCoord.w + normal.xz * 0.05;
	WaterBody body = waterBodyAt(shore, clarity, 0.2 + 0.8 * daylight);
	vec3 reflected = mix(texture2D(tDiffuse, reflectUv).rgb * ReflectionTint, body.colour, BodyInReflection);
	vec3 bounce = reflect(-sunDirection, normal);
	float glint = pow(max(dot(bounce, toEye), 0.0), 220.0) * step(0.0, sunDirection.y);
	vec3 light = reflected * fresnel + sunColour * glint * 1.2;
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
