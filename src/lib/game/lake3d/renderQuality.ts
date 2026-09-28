import { GenerousCover, ModestCover, type CoverQuality } from './grass/coverTiers';

export interface RenderQuality {
	mostPixelRatio: number;
	multisamples: number;
	reflectionScale: number;
	cover: CoverQuality;
	hasBloom: boolean;
}

const Generous: RenderQuality = { mostPixelRatio: 2, multisamples: 4, reflectionScale: 0.5, cover: GenerousCover, hasBloom: true };
const Modest: RenderQuality = { mostPixelRatio: 1.5, multisamples: 0, reflectionScale: 0.3, cover: ModestCover, hasBloom: false };
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
