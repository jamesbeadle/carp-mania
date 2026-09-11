export const StarterFishery = {
	Money: 5000,
	Acres: 10,
	CarpCount: 100,
	DayTicketFee: 20
} as const;

export const Prices = {
	CarpPerPound: 45,
	BigCarpPremiumAboveLb: 25,
	BigCarpPremiumPerPound: 60,
	Pike: 120,
	PikeFoodPerUnit: 15,
	BailiffDailyWage: 60
} as const;

export const PikeRules = {
	MaximumWeightLb: 8,
	SickCarpConditionBelow: 35,
	FoodEatenPerPikePerDay: 0.2,
	StarveDieBackChance: 0.15,
	MaximumSensiblePerTenAcres: 6
} as const;

export const FeeCollection = {
	WithBailiff: 1,
	WithoutBailiff: 0.55
} as const;

export function priceOfCarp(weightPounds: number) {
	const basePrice = weightPounds * Prices.CarpPerPound;
	const poundsOverPremiumLine = Math.max(0, weightPounds - Prices.BigCarpPremiumAboveLb);
	return Math.round(basePrice + poundsOverPremiumLine * Prices.BigCarpPremiumPerPound);
}
