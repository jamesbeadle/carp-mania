import type { Farm, FarmGrade } from './farms';

export const FarmWantsWaterRating: Record<FarmGrade, number> = { stock: 0, good: 25, specialist: 45, record: 65 };

export function doesFarmSellTo(grade: FarmGrade, waterRating: number) {
	return waterRating >= FarmWantsWaterRating[grade];
}

export function farmStandingWords(farm: Farm, waterRating: number) {
	const wanted = FarmWantsWaterRating[farm.grade];
	if (wanted === FarmWantsWaterRating.stock) return 'Sells to any water';
	const rating = Math.round(waterRating);
	if (doesFarmSellTo(farm.grade, waterRating)) return `Sells to waters rated ${wanted} and above — yours is rated ${rating}`;
	return `Sells only to waters rated ${wanted} and above — yours is rated ${rating}, so ${farm.name} will not take your order yet`;
}
