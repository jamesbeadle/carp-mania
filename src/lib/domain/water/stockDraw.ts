import { stockBySize, type SizeBandName } from '../stock/stockBySize';

export const PullPerFish: Record<SizeBandName, number> = { singles: 0.05, doubles: 0.15, twenties: 0.6, thirties: 2.5, forties: 12, fifties: 60 };
export const Draw = { CountExponent: 0.6, DrawPerAnglerFactor: 40, MostAnglerFactor: 2.5, DrawPerPayFactor: 70, MostPayFactor: 1.5, RenownFloor: 25, RenownPerDraw: 0.8, RenownDriftPerDay: 0.5, PrizeRatingPerDraw: 0.25, MostPrizeRating: 25 } as const;

type Weighed = { weight_lb: number };
type Shoaled = { count: number; average_weight_lb: number };

export function stockDrawOf(carp: Weighed[], shoals: Shoaled[] = []) {
	return stockBySize(carp, shoals).reduce((total, line) => total + PullPerFish[line.band.name] * Math.pow(line.count, Draw.CountExponent), 0);
}

export function drawAnglerFactor(stockDraw: number) {
	return 1 + Math.min(Draw.MostAnglerFactor, stockDraw / Draw.DrawPerAnglerFactor);
}

export function drawPayFactor(stockDraw: number) {
	return 1 + Math.min(Draw.MostPayFactor, stockDraw / Draw.DrawPerPayFactor);
}

export function stockRenownOf(stockDraw: number) {
	return Math.min(100, Draw.RenownFloor + stockDraw * Draw.RenownPerDraw);
}

export function prizeAnglerBonus(stockDraw: number) {
	return Math.min(Draw.MostPrizeRating, stockDraw * Draw.PrizeRatingPerDraw);
}

export function drawWords(stockDraw: number) {
	if (stockDraw >= 60) return 'a holy grail — the diary is full';
	if (stockDraw >= 30) return 'a destination — anglers travel for it';
	if (stockDraw >= 12) return 'a club water — a reachable personal best';
	return 'a starter water — stock, not a draw';
}
