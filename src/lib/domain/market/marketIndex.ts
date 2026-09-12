import { priceBandLabel } from './valuation';

export interface SaleForIndex {
	weightLb: number;
	price: number;
}

export interface IndexBand {
	label: string;
	poundsPerLb: number;
	sales: number;
}

export const MarketIndexWindowFisheryDays = 7;

export function marketIndexFrom(sales: SaleForIndex[]): IndexBand[] {
	const byBand = new Map<string, SaleForIndex[]>();
	for (const sale of sales) {
		const label = priceBandLabel(sale.weightLb);
		byBand.set(label, [...(byBand.get(label) ?? []), sale]);
	}
	return [...byBand.entries()]
		.map(([label, bandSales]) => ({ label, poundsPerLb: averagePoundsPerLb(bandSales), sales: bandSales.length }))
		.sort((first, second) => Number.parseInt(first.label) - Number.parseInt(second.label));
}

function averagePoundsPerLb(sales: SaleForIndex[]) {
	const totalPrice = sales.reduce((total, sale) => total + sale.price, 0);
	const totalWeight = sales.reduce((total, sale) => total + sale.weightLb, 0);
	return totalWeight === 0 ? 0 : Math.round(totalPrice / totalWeight);
}
