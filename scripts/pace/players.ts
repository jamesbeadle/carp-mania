import { newAngler, tierUnlockedAt, type Angler } from './angler';
import { seasonAt } from './fisheryDay';
import { isOpen, biggestLb, type Lake } from './lake';
import { runOwnersDay, type Owner } from './owner';
import type { Archetype, SitePreset } from './roster';
import { Clock, TierKitCost } from './rules';
import { fishOneSession, type SessionDay } from './session';
import { Money } from './shelf';

export interface Player extends Owner {
	index: number;
	angler: Angler;
	site: SitePreset;
}

export function newPlayer(index: number, archetype: Archetype, site: SitePreset, lake: Lake, money: number): Player {
	return { index, archetype, site, lake, money, angler: newAngler() };
}

export function isActiveOn(player: Player, realDay: number) {
	const dayOfWeek = (realDay + player.index) % Clock.RealDaysPerWeek;
	return dayOfWeek < player.archetype.activeDaysPerWeek;
}

export function playTheDay(player: Player, players: Player[], lakes: Lake[], day: SessionDay) {
	runOwnersDay(player, day.random);
	buyTackle(player);
	for (let session = 0; session < player.archetype.sessionsPerActiveDay; session++) fishOnce(player, players, lakes, day);
}

function buyTackle(player: Player) {
	const angler = player.angler;
	const unlocked = tierUnlockedAt(angler.level);
	const cost = TierKitCost[unlocked];
	const isUpgrade = unlocked !== angler.tier && cost > TierKitCost[angler.tier];
	const isAffordable = player.money >= cost * 2;
	if (isUpgrade && isAffordable) buyTheKit(player, unlocked, cost);
}

function buyTheKit(player: Player, tier: Angler['tier'], cost: number) {
	player.money -= cost;
	player.angler.tier = tier;
}

function fishOnce(player: Player, players: Player[], lakes: Lake[], day: SessionDay) {
	const water = chooseWater(player, lakes, day);
	if (!water) return;
	const isAway = water.id !== player.lake.id;
	if (isAway) payTheTicket(player, players[water.ownerIndex], water.price);
	fishOneSession(player.angler, water, { ...day, today: water.fisheryDay, season: seasonAt(water.fisheryDay, water.region) });
}

function payTheTicket(player: Player, owner: Player, price: number) {
	player.money -= price;
	owner.money += price;
}

function chooseWater(player: Player, lakes: Lake[], day: SessionDay): Lake | null {
	const home = player.lake;
	const isHomeOpen = isOpen(home, Money.FishToOpen);
	const staysHome = day.random() < player.archetype.homeShare;
	if (staysHome && isHomeOpen) return home;
	const budget = Math.max(Money.LeastTicketBudget, player.money * Money.TicketBudgetShare);
	const reachable = lakes.filter((lake) => lake.id !== home.id && isOpen(lake, Money.FishToOpen) && lake.price <= budget);
	if (reachable.length === 0) return isHomeOpen ? home : null;
	return reachable.reduce((best, lake) => (biggestLb(lake) > biggestLb(best) ? lake : best));
}
