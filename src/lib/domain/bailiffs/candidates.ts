import { fisheryWeekNumber } from '../market/fishFarm';
import { randomBetween, seededRandom } from '../random';
import { WaterScale } from '../waterQuality';
import { wageFor } from './bailiffTeam';

export interface Candidate {
	id: string;
	name: string;
	askingWage: number;
	aptitude: number;
	reference: string;
}

export const Candidates = { PerWeek: 3, LowestAptitude: 40, HighestAptitude: 95 } as const;
const References = { KeenAbove: 80, SteadyAbove: 60, SleepsInBelow: 50 } as const;
const CandidateSalt = 4241;
const FirstNames = ['Alan', 'Barry', 'Colin', 'Dave', 'Eric', 'Frank', 'Gordon', 'Harry', 'Ian', 'Jim', 'Ken', 'Len', 'Mick', 'Norman', 'Pete', 'Ray', 'Stan', 'Terry', 'Vic', 'Wilf'];
const Surnames = ['Ashcroft', 'Bailey', 'Coombes', 'Dunn', 'Evans', 'Fletcher', 'Griffin', 'Hobbs', 'Ingram', 'Jarvis', 'Kemp', 'Lomax', 'Mellor', 'Nolan', 'Oakes', 'Pratt', 'Rudd', 'Sowerby', 'Tate', 'Whitlock'];

export function candidatesThisWeek(lakeId: string, now: Date): Candidate[] {
	const week = fisheryWeekNumber(now);
	const random = seededRandom(week * CandidateSalt + hashOf(lakeId));
	return Array.from({ length: Candidates.PerWeek }, (_, index) => candidateFor(lakeId, week, index, random));
}

function candidateFor(lakeId: string, week: number, index: number, random: () => number): Candidate {
	const aptitude = Math.round(randomBetween(random, Candidates.LowestAptitude, Candidates.HighestAptitude));
	const firstName = FirstNames[Math.floor(random() * FirstNames.length)];
	const surname = Surnames[Math.floor(random() * Surnames.length)];
	return { id: `${lakeId}-${week}-${index}`, name: `${firstName} ${surname}`, askingWage: wageFor(aptitude), aptitude, reference: referenceFor(aptitude) };
}

export function referenceFor(aptitude: number) {
	if (aptitude >= References.KeenAbove) return 'keen';
	if (aptitude >= References.SteadyAbove) return 'steady';
	if (aptitude < References.SleepsInBelow) return 'sleeps in';
	return 'will do';
}

export function isAptitude(value: number) {
	return value >= WaterScale.Worst && value <= WaterScale.Best;
}

function hashOf(text: string) {
	let hash = 0;
	for (const character of text) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	return hash;
}
