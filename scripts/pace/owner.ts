import { builtAfter, FacilityCatalogue, whyFacilityCannotBeBuilt } from '../../src/lib/domain/groundworks/facilities';
import type { RandomFraction } from '../../src/lib/domain/random';
import { biomassPerAcre, densityPerAcre, priceBandOf, type Lake } from './lake';
import type { Archetype } from './roster';
import { Density, RatingTerms } from './rules';
import { FacilityOrder, FillBand, Money } from './shelf';
import { biggestBandOpenTo, buyFish, fishAffordable, reserveFor, type Purse } from './shopping';
import { keepFed } from './feeding';

export interface Owner extends Purse {
	archetype: Archetype;
	lake: Lake;
}

export function runOwnersDay(owner: Owner, random: RandomFraction) {
	keepFed(owner, reserveOf(owner));
	setThePrice(owner);
	if (!owner.archetype.isInvesting) return;
	keepBailiff(owner);
	fillTheHead(owner, random);
	stockThePrize(owner, random);
	buildNextFacility(owner);
	extendGroundworks(owner);
	addSwims(owner);
}

function reserveOf(owner: Owner) {
	return reserveFor(owner.lake, owner.archetype.feed);
}

function setThePrice(owner: Owner) {
	const band = priceBandOf(owner.lake.rating);
	const isInvesting = owner.archetype.isInvesting;
	owner.lake.price = isInvesting ? Math.round((band.floor + band.ceiling) / 2) : Math.round(band.floor);
}

function keepBailiff(owner: Owner) {
	const canAfford = owner.money > reserveOf(owner);
	if (canAfford) owner.lake.hasBailiff = true;
}

function buildNextFacility(owner: Owner) {
	const lake = owner.lake;
	const next = FacilityOrder.find((facility) => whyFacilityCannotBeBuilt(lake.facilities, facility) === null);
	if (!next) return;
	const cost = FacilityCatalogue[next].cost;
	const isAffordable = owner.money - cost >= reserveOf(owner);
	if (!isAffordable) return;
	owner.money -= cost;
	lake.facilities = builtAfter(lake.facilities, next);
	lake.facilitiesSpent += cost;
}

function extendGroundworks(owner: Owner) {
	const lake = owner.lake;
	const isWorthIt = lake.coverage < Money.MostCoverage && lake.facilities.length >= 2;
	const isAffordable = owner.money - Money.GroundworksStep >= reserveOf(owner);
	if (!isWorthIt || !isAffordable) return;
	owner.money -= Money.GroundworksStep;
	lake.coverage = Math.min(Money.MostCoverage, lake.coverage + Money.CoveragePerStep);
}

function addSwims(owner: Owner) {
	const lake = owner.lake;
	const wanted = Math.round(lake.acres * Money.SwimsPerAcre);
	while (lake.swims < wanted && owner.money - Money.SwimCost >= reserveOf(owner)) {
		owner.money -= Money.SwimCost;
		lake.swims += 1;
	}
}

function stockThePrize(owner: Owner, random: RandomFraction) {
	const lake = owner.lake;
	const band = biggestBandOpenTo(lake.rating);
	const topAlready = lake.fish.filter((fish) => fish.weightLb >= band.fromLb).length;
	const wanted = Math.min(owner.archetype.prizeFishAtOnce, RatingTerms.TopFishCounted - topAlready);
	const affordable = fishAffordable(band, owner.money - reserveOf(owner));
	const count = Math.min(wanted, affordable);
	const hasRoom = densityPerAcre(lake) < Density.CrowdedPerAcre && biomassPerAcre(lake) < Density.HeavyAboveLbPerAcre;
	if (count > 0 && hasRoom) buyFish(owner, lake, band, count, random);
}

function fillTheHead(owner: Owner, random: RandomFraction) {
	const lake = owner.lake;
	const target = Math.max(Money.FishToOpen, Math.round(Density.IdealFromPerAcre * lake.acres));
	const short = target - lake.fish.length;
	const affordable = fishAffordable(FillBand, owner.money - reserveOf(owner));
	const count = Math.min(short, affordable);
	if (count > 0) buyFish(owner, lake, FillBand, count, random);
}
