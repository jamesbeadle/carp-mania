export const StartingFloat = { Money: 100000, GiftToExistingPlayers: 95000 } as const;

export const ClassicFishery = {
	Acres: 10,
	CarpCount: 100,
	DayTicketFee: 20
} as const;

export const Prices = {
	Pike: 120,
	PikeFoodPerUnit: 15,
	BailiffDailyWage: 60,
	AeratorDailyRunning: 15
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

export const FacilityEffects = {
	CarParkAnglerFactor: 1.15,
	LodgeTakingsPerAngler: 4
} as const;
