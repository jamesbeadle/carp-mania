export interface CoverQuality {
	density: number;
	cellPixels: number;
	isShadowed: boolean;
	isDetailed: boolean;
	reach: number;
}

export const GenerousCover: CoverQuality = { density: 1, cellPixels: 256, isShadowed: true, isDetailed: true, reach: 1 };
export const ModestCover: CoverQuality = { density: 0.5, cellPixels: 128, isShadowed: false, isDetailed: false, reach: 0.65 };
