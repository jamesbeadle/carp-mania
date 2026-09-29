export interface CoverQuality {
	density: number;
	cellPixels: number;
	isShadowed: boolean;
	isDetailed: boolean;
	reach: number;
	nearSwimBoost: number;
	swardSpan: number;
	swardPerSquareMetre: number;
	swardTexelMetres: number;
}

export const GenerousCover: CoverQuality = {
	density: 1,
	cellPixels: 256,
	isShadowed: true,
	isDetailed: true,
	reach: 1,
	nearSwimBoost: 1.6,
	swardSpan: 34,
	swardPerSquareMetre: 30,
	swardTexelMetres: 1
};

export const ModestCover: CoverQuality = {
	density: 0.6,
	cellPixels: 128,
	isShadowed: false,
	isDetailed: false,
	reach: 0.65,
	nearSwimBoost: 1,
	swardSpan: 22,
	swardPerSquareMetre: 16,
	swardTexelMetres: 1.5
};
