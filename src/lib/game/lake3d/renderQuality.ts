export interface RenderQuality {
	mostPixelRatio: number;
	multisamples: number;
	reflectionScale: number;
	grassTufts: number;
	hasBloom: boolean;
	hasAmbientOcclusion: boolean;
	shadowMapPixels: number;
	cloudOctaves: number;
}

const Generous: RenderQuality = { mostPixelRatio: 2, multisamples: 4, reflectionScale: 0.5, grassTufts: 26000, hasBloom: true, hasAmbientOcclusion: true, shadowMapPixels: 2560, cloudOctaves: 6 };
const Modest: RenderQuality = { mostPixelRatio: 1.5, multisamples: 0, reflectionScale: 0.3, grassTufts: 9000, hasBloom: false, hasAmbientOcclusion: false, shadowMapPixels: 1024, cloudOctaves: 4 };
const FewestCoresForGenerous = 6;

let chosen: RenderQuality | null = null;

function isModestDevice() {
	const isTouch = window.matchMedia('(pointer: coarse)').matches;
	const cores = navigator.hardwareConcurrency ?? FewestCoresForGenerous;
	return isTouch || cores < FewestCoresForGenerous;
}

export function renderQuality(): RenderQuality {
	chosen ??= isModestDevice() ? Modest : Generous;
	return chosen;
}

export const NearDetailLayer = 1;
