import { median } from './draws';
import { guidePriceOf } from './fish';
import { biggestLb } from './lake';
import type { Player } from './players';
import { Archetypes, type ArchetypeName } from './roster';
import { Milestones, type MilestoneLb } from './rules';
import type { World } from './world';

const NeverInTheYear = Number.POSITIVE_INFINITY;
const ThousandPounds = 1000;

export function firstLandedMedian(players: Player[], milestone: MilestoneLb) {
	return median(players.map((player) => player.angler.firstLandedDay.get(milestone) ?? NeverInTheYear));
}

export function firstOwnedMedian(players: Player[], milestone: MilestoneLb) {
	return median(players.map((player) => player.lake.firstOwnedDay.get(milestone) ?? NeverInTheYear));
}

export function playersOf(world: World, archetype: ArchetypeName) {
	return world.players.filter((player) => player.archetype.name === archetype);
}

export function dayWords(day: number) {
	return Number.isFinite(day) ? `day ${Math.round(day)}` : 'not in the year';
}

export function paceRows(world: World) {
	return (Object.keys(Archetypes) as ArchetypeName[]).map((name) => {
		const players = playersOf(world, name);
		const landed = Milestones.map((milestone) => dayWords(firstLandedMedian(players, milestone)));
		const owned = Milestones.slice(1).map((milestone) => dayWords(firstOwnedMedian(players, milestone)));
		return [name, String(players.length), ...landed, ...owned];
	});
}

export function stockValueOf(player: Player) {
	return player.lake.fish.reduce((total, fish) => total + guidePriceOf(fish), 0);
}

export function endOfYearRows(world: World) {
	return (Object.keys(Archetypes) as ArchetypeName[]).map((name) => {
		const players = playersOf(world, name);
		const angler = (pick: (player: Player) => number) => median(players.map(pick));
		return [
			name,
			String(Math.round(angler((player) => player.angler.level))),
			String(Math.round(angler((player) => player.angler.personalBestLb))),
			String(Math.round(angler((player) => player.angler.fishLanded))),
			String(Math.round(angler((player) => player.lake.rating))),
			String(Math.round(angler((player) => biggestLb(player.lake)))),
			thousands(angler((player) => player.money)),
			thousands(angler(stockValueOf))
		];
	});
}

export function ladderRows(world: World) {
	return world.ladder.map((row) => [String(row.month), row.biggestLb.toFixed(1), String(row.forties), String(row.fifties), String(Math.round(row.topRating)), String(row.diedOfOldAge)]);
}

export function takingsRows(world: World) {
	return world.takings.map((band, index) => {
		const from = index * 20;
		const hasDays = band.days > 0;
		const net = hasDays ? (band.income - band.costs) / band.days : 0;
		return [`${from}–${from + 20}`, String(band.days), hasDays ? pounds(band.income / band.days) : '—', hasDays ? pounds(band.costs / band.days) : '—', hasDays ? pounds(net) : '—', hasDays ? pounds(net * 24) : '—'];
	});
}

export function diaryRows(world: World) {
	return world.diary.map((entry) => [entry.archetype, String(entry.realDay), String(Math.round(entry.rating)), thousands(entry.money), String(entry.level), entry.biggestLb.toFixed(1), entry.personalBestLb.toFixed(1)]);
}

export function thousands(money: number) {
	return `£${Math.round(money / ThousandPounds)}k`;
}

export function pounds(money: number) {
	return `£${Math.round(money)}`;
}

export function printTable(title: string, headers: string[], rows: string[][]) {
	const widths = headers.map((header, column) => Math.max(header.length, ...rows.map((row) => row[column].length)));
	const line = (cells: string[]) => cells.map((cell, column) => cell.padEnd(widths[column])).join('  ');
	console.log(`\n${title}\n${line(headers)}\n${widths.map((width) => '-'.repeat(width)).join('  ')}`);
	for (const row of rows) console.log(line(row));
}
