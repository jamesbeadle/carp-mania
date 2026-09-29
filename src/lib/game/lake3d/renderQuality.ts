import { GenerousCover, ModestCover, type CoverQuality } from './grass/coverTiers';

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
	treeCardShare: number;
	nearTreeMetres: number;
	treeAtlasPixels: number;
	treeVariantsSingleDraw: number;
	hasAmbientOcclusion: boolean;
	shadowMapPixels: number;
	hasCascadedShadows: boolean;
	cloudOctaves: number;
	hasCloudShadows: boolean;
}

const Generous: RenderQuality = {
	mostPixelRatio: 2,
	multisamples: 4,
	reflectionScale: 0.5,
	grassTufts: 26000,
	hasBloom: true,
	shoreSpacingMetres: 0.65,
	groundTilePixels: 512,
	groundCells: 256,
	hasDetailedGround: true,
	treeCardShare: 1,
	nearTreeMetres: 55,
	treeAtlasPixels: 4096,
	treeVariantsSingleDraw: 2,
	hasAmbientOcclusion: true,
	shadowMapPixels: 2560,
	hasCascadedShadows: true,
	cloudOctaves: 6,
	hasCloudShadows: true
};

const Modest: RenderQuality = {
	mostPixelRatio: 1.5,
	multisamples: 0,
	reflectionScale: 0.3,
	grassTufts: 9000,
	hasBloom: false,
	shoreSpacingMetres: 1.1,
	groundTilePixels: 256,
	groundCells: 180,
	hasDetailedGround: false,
	treeCardShare: 0.5,
	nearTreeMetres: 35,
	treeAtlasPixels: 1024,
	treeVariantsSingleDraw: 1,
	hasAmbientOcclusion: false,
	shadowMapPixels: 1024,
	hasCascadedShadows: false,
	cloudOctaves: 4,
	hasCloudShadows: false
};

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

export function coverQuality(): CoverQuality {
	return renderQuality() === Generous ? GenerousCover : ModestCover;
}

export const NearDetailLayer = 1;
