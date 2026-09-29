import { MathUtils } from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import type { SkyMood } from './skyLook';
import { sunSkyPositionOf, type SunPlacement } from './sunAndSky';

const SkyScale = 9000;
const LowSun = { FullDayDegrees: 20, ExtraRayleigh: 0.9, MieShed: 0.6 } as const;
const SkyBrightness = 0.1;
const FinalColour = 'gl_FragColor = vec4( texColor, 1.0 );';

export function createClearSky(isSunShown: boolean) {
	const sky = new Sky();
	sky.scale.setScalar(SkyScale);
	const { material } = sky;
	const { uniforms } = material;
	const { cloudCoverage, showSunDisc } = uniforms;
	cloudCoverage.value = 0;
	showSunDisc.value = Number(isSunShown);
	uniforms.brightness = { value: SkyBrightness };
	const dimmed = material.fragmentShader.replace(FinalColour, 'gl_FragColor = vec4( texColor * brightness, 1.0 );');
	material.fragmentShader = dimmed.replace('void main', 'uniform float brightness;\nvoid main');
	return sky;
}

export function paintSky(sky: Sky, mood: SkyMood, placement: SunPlacement) {
	const { material } = sky;
	const { turbidity, rayleigh, mieCoefficient, mieDirectionalG, sunPosition, brightness } = material.uniforms;
	brightness.value = SkyBrightness * mood.skyShade;
	const lowness = 1 - MathUtils.clamp(placement.elevationDegrees / LowSun.FullDayDegrees, 0, 1);
	turbidity.value = mood.turbidity;
	rayleigh.value = mood.rayleigh + LowSun.ExtraRayleigh * lowness;
	mieCoefficient.value = mood.mieCoefficient * (1 - LowSun.MieShed * lowness);
	mieDirectionalG.value = mood.mieDirectionalG;
	sunPosition.value.copy(sunSkyPositionOf(placement));
}
