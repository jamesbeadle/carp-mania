import type { Tier } from '../../src/lib/domain/tackle/brands';

export const Clock = { FisheryDaysPerRealDay: 24, RealDaysSimulated: 365, RealDaysPerWeek: 7, RealDaysPerMonth: 30 } as const;
export const DiaryDays = [1, 3, 7, 14, 30, 60, 90, 180, 270, 365] as const;

export const Growth = { PoundsPerDayAtTwenty: 0.055, TwentyLb: 20, HalvesEveryLb: 6, ReachPower: 4, NaturalProtein: 0.5, NaturalRationAtFullFertility: 0.4 } as const;
export const Lifespan = { SafeUntilYears: 35, ChanceInFirstOldYear: 0.05, ExtraChancePerYear: 0.015, CertainAtYears: 55 } as const;
export const Condition = { FedTarget: 90, FedGainPerDay: 2, HungryBelow: 0.5, HungerLossPerDay: 1.5, CrowdedLossPerDay: 1, ShrinksBelow: 40, PoundsLostPerDay: 0.02, Lowest: 5, Highest: 100 } as const;
export const Density = { IdealFromPerAcre: 12, IdealToPerAcre: 30, CrowdedPerAcre: 60, HeavyAboveLbPerAcre: 400 } as const;
export const CeilingTerms = { MouthsFloor: 0.55, ConfidenceFloor: 0.65, FullFeatureShare: 0.25, QualityFloor: 0.8 } as const;
export const Wariness = { RecentDays: 10, PerCapture: 0.08, Most: 0.4 } as const;
export const Appetite = { Floor: 0.5, PerConditionPoint: 1 / 200 } as const;
export const Fame = { PlayerCatch: 3, VisitorCatch: 1, VisitorCatchFromLb: 20, LakeRecord: 10, WorldRecord: 50, PersonalBest: 2, MostFactor: 1.5, PerFamePoint: 1 / 100 } as const;
export const ConditionValue = { Floor: 0.6, PerConditionPoint: 1 / 250 } as const;

export const WaterDrift = { TendedTarget: 85, UntendedTarget: 45, AeratorBonus: 5, PerDay: 1, Best: 100 } as const;

export const RatingWeights = { Facilities: 20, Head: 15, Quality: 25, CatchRate: 20, Water: 20 } as const;
export const RatingBands = 5;
export const RatingTerms = { Highest: 100, FacilitiesForFullMarks: 100000, QualityBenchmarkLb: 50, TopFishCounted: 10, LandedPerAnglerDayForFullMarks: 4, CatchWindowDays: 30 } as const;

export const TicketBand = { FloorPerRatingPoint: 0.5, CeilingPerRatingPoint: 1, LeastPrice: 3 } as const;
export const Demand = { FewestAnglers: 1, MostAnglers: 5, RatingPower: 1.5, PegsPerSwim: 1.4, ArrivalsAtFloor: 1.2, ArrivalsAtCeiling: 0.6, CollectionWithBailiff: 1, CollectionWithout: 0.55 } as const;
export const Visitors = { LandedPerDay: 4, QualityFloor: 0.5, LevelPerRatingPoint: 0.5, SessionsKnown: 10, TackleShare: 0.6 } as const;
export const SponsorshipMoney = { FromRating: 50, LeastPerTerm: 2000, MostPerTerm: 60000, Curve: 1.6, TermDays: 180 } as const;
export const Season = { BiteFloor: 0.6, BiteRange: 0.4, AnglerFloor: 0.6, AnglerRange: 0.4 } as const;

export const Odds = { Start: 3, LakeRatingPull: 1.5, LevelPull: 0.6, KnowledgePull: 0.6, TacklePull: 0.3, Floor: 0.35, LevelForFullPull: 60, SessionsForFullKnowledge: 20 } as const;
export const Bites = { PerSession: 6, MostPerSession: 10, LevelSwing: 0.15, TackleSwing: 0.3, HookHold: 0.92, FightWon: 0.85, BigFishFightLoss: 0.25, BigFishFromLb: 25, BigFishSpanLb: 25 } as const;

export const Experience = { WeightPower: 1.5, PerSession: 20, NewWater: 200, NoveltyHalfSessions: 50, PersonalBestFactor: 2, LevelCost: 50, LevelPower: 2.2 } as const;
export const TierAtLevel: Record<Tier, number> = { starter: 0, club: 10, specialist: 25, custom: 45 };
export const TierKitCost: Record<Tier, number> = { starter: 0, club: 900, specialist: 3000, custom: 8000 };

export const Milestones = [20, 30, 40, 50] as const;
export type MilestoneLb = (typeof Milestones)[number];

export const PaceTargets: Record<MilestoneLb, { noSoonerThanDay: number; byDay: number }> = {
	20: { noSoonerThanDay: 2, byDay: 6 },
	30: { noSoonerThanDay: 5, byDay: 14 },
	40: { noSoonerThanDay: 45, byDay: 110 },
	50: { noSoonerThanDay: 200, byDay: 365 }
};
