export interface CoverQuality {
	density: number;
	cellPixels: number;
	isShadowed: boolean;
	isDetailed: boolean;
	reach: number;
	nearSwimBoost: number;
}

export const GenerousCover: CoverQuality = { density: 1, cellPixels: 256, isShadowed: true, isDetailed: true, reach: 1, nearSwimBoost: 2.4 };
export const ModestCover: CoverQuality = { density: 0.5, cellPixels: 128, isShadowed: false, isDetailed: false, reach: 0.65, nearSwimBoost: 1.1 };
