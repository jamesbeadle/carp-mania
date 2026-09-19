import assert from 'node:assert/strict';
import { arrivesAsAShoal, farmShoalFor } from '../src/lib/domain/market/farmDelivery';
import { SizeBands, type FarmPack } from '../src/lib/domain/market/farmPacks';
import { shoalBiomassLb } from '../src/lib/domain/stock/shoals';
import { stockBySize } from '../src/lib/domain/stock/stockBySize';

export function packAndSizesScenario() {
	const stockies: FarmPack = { id: 'pack', farmId: 'meadow-fisheries', band: SizeBands[0], count: 200, price: 100, conditionLowest: 75, conditionHighest: 85 };
	assert.ok(arrivesAsAShoal(stockies, 50) && arrivesAsAShoal(stockies, 5), 'stockies arrive as a shoal, however few');
	const forties: FarmPack = { ...stockies, band: SizeBands[6] };
	assert.ok(!arrivesAsAShoal(forties, 3), 'three forties are named fish');
	const shoal = farmShoalFor(stockies, 50, 'lake-1');
	assert.ok(shoal.average_weight_lb === 5 && shoal.age_years === 2, 'a pack of 4–6 lb fish arrives at five pounds, aged two');
	assert.equal(shoalBiomassLb(shoal), 250);
	const bySize = stockBySize([{ weight_lb: 25 }], [{ count: 50, average_weight_lb: 5 }]);
	assert.equal(bySize[0].count, 50, 'the size breakdown counts the shoal');
	assert.equal(bySize[2].count, 1);
}

