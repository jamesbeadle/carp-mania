export interface RenderQuality {
	mostPixelRatio: number;
	multisamples: number;
	reflectionScale: number;
	coverDensity: number;
	coverCellPixels: number;
	hasBloom: boolean;
}

const Generous: RenderQuality = { mostPixelRatio: 2, multisamples: 4, reflectionScale: 0.5, coverDensity: 1, coverCellPixels: 256, hasBloom: true };
const Modest: RenderQuality = { mostPixelRatio: 1.5, multisamples: 0, reflectionScale: 0.3, coverDensity: 0.45, coverCellPixels: 128, hasBloom: false };
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
