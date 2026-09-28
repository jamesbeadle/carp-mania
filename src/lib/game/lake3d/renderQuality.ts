export interface RenderQuality {
	mostPixelRatio: number;
	multisamples: number;
	reflectionScale: number;
	grassTufts: number;
	hasBloom: boolean;
	countryReach: number;
	hedgeSpacing: number;
	hedgeDetail: number;
	leafCardShare: number;
}

const Generous: RenderQuality = { mostPixelRatio: 2, multisamples: 4, reflectionScale: 0.5, grassTufts: 26000, hasBloom: true, countryReach: 950, hedgeSpacing: 3.6, hedgeDetail: 1, leafCardShare: 1 };
const Modest: RenderQuality = { mostPixelRatio: 1.5, multisamples: 0, reflectionScale: 0.3, grassTufts: 9000, hasBloom: false, countryReach: 700, hedgeSpacing: 5.5, hedgeDetail: 0, leafCardShare: 0.6 };
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
