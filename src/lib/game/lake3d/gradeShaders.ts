export const GradeLook = { Warmth: 0.03, Vibrance: 0.17, Contrast: 0.2, VignetteDarkness: 0.18, VignetteReach: 0.85 } as const;

export function gradeUniforms() {
	return {
		warmth: { value: GradeLook.Warmth },
		vibrance: { value: GradeLook.Vibrance },
		contrast: { value: GradeLook.Contrast },
		vignetteDarkness: { value: GradeLook.VignetteDarkness },
		vignetteReach: { value: GradeLook.VignetteReach }
	};
}

export const GradeFunction = `
uniform float warmth;
uniform float vibrance;
uniform float contrast;
uniform float vignetteDarkness;
uniform float vignetteReach;
vec3 graded(vec3 texel, vec2 uv) {
	vec3 colour = clamp(texel, 0.0, 1.0);
	colour = mix(colour, colour * colour * (3.0 - 2.0 * colour), contrast);
	float grey = dot(colour, vec3(0.2126, 0.7152, 0.0722));
	float chroma = max(colour.r, max(colour.g, colour.b)) - min(colour.r, min(colour.g, colour.b));
	colour = mix(vec3(grey), colour, 1.0 + vibrance * (1.0 - chroma));
	colour *= vec3(1.0 + warmth, 1.0 + warmth * 0.3, 1.0 - warmth);
	float fromCentre = distance(uv, vec2(0.5)) * 1.41421;
	colour *= 1.0 - vignetteDarkness * smoothstep(vignetteReach * 0.45, vignetteReach + 0.35, fromCentre);
	float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
	return colour + dither / 255.0;
}`;
