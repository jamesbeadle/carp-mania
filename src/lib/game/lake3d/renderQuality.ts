export interface RenderQuality {
	mostPixelRatio: number;
	multisamples: number;
	reflectionScale: number;
	grassTufts: number;
	hasBloom: boolean;
	shoreSpacingMetres: number;
	groundTilePixels: number;
	groundCells: number;
	hasDetailedGround: boolean;
}

const Generous: RenderQuality = { mostPixelRatio: 2, multisamples: 4, reflectionScale: 0.5, grassTufts: 26000, hasBloom: true, shoreSpacingMetres: 0.65, groundTilePixels: 512, groundCells: 256, hasDetailedGround: true };
const Modest: RenderQuality = { mostPixelRatio: 1.5, multisamples: 0, reflectionScale: 0.3, grassTufts: 9000, hasBloom: false, shoreSpacingMetres: 1.1, groundTilePixels: 256, groundCells: 180, hasDetailedGround: false };
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
