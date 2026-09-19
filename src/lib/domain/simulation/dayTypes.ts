import type { Bailiff } from '../bailiffs/bailiffTeam';
import type { NewBounty } from '../bounties/bountyDraw';
import type { TicketProduct } from '../fishing/ticketBook';
import type { StandingRecords } from '../market/records';
import type { BookedWindow } from '../matches/bookings';
import type { Carp, Lake } from '../types';
import type { Season } from '../world/seasons';
import type { LakeSpecies } from '../water/species';
import type { LakeWork } from '../worldTypes';
import type { NewNamedFish } from '../stock/individualise';
import type { NewShoal, Shoal } from '../stock/shoals';
import type { NewCatch, NewVisit } from './visitingAnglers';

export interface DayContext {
	dayStart: Date;
	dayEnd: Date;
	season: Season;
	records: StandingRecords;
	works: LakeWork[];
	bookings: BookedWindow[];
	book: TicketProduct[];
	bailiffs: Bailiff[];
	species: LakeSpecies[];
	swimCount: number;
	pegsBooked: number;
	hasOpenBounty: boolean;
}

export interface DayOutcome {
	lake: Lake;
	carp: Carp[];
	catches: NewCatch[];
	visits: NewVisit[];
	carpTakenByPike: Carp[];
	carpDiedOfOldAge: Carp[];
	arrivedCarp: Carp[];
	carpOutOfQuarantine: Carp[];
	feesCollected: number;
	lodgeTakings: number;
	bailiffWages: number;
	aeratorRunning: number;
	isHeatwave: boolean;
	records: StandingRecords;
	worksCompleted: LakeWork[];
	shoals: Shoal[];
	fryShoals: NewShoal[];
	namedFromShoals: NewNamedFish[];
	shoalFishTakenByPike: number;
	bailiffs: Bailiff[];
	turnedAway: number;
	bountyDrawn: NewBounty | null;
}

