import { marketIndexFrom, MarketIndexWindowFisheryDays, type IndexBand, type SaleForIndex } from '$lib/domain/market/marketIndex';
import type { TransferKind } from '$lib/domain/marketTypes';
import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
import { trustedSupabase } from '$lib/supabase/createTrustedSupabase';
import { requireUser } from '../gates/requireUser';

const Sale: TransferKind = 'sale';

type SaleRow = { price: number; carp: { weight_lb: number } | null };

export async function GetMarketIndex(locals: App.Locals): Promise<IndexBand[]> {
	requireUser(locals);
	const sales = await loadRecentSales(new Date());
	return marketIndexFrom(sales.filter(hasFishStill).map(saleForIndex));
}

async function loadRecentSales(now: Date): Promise<SaleRow[]> {
	const windowStart = new Date(now.getTime() - MarketIndexWindowFisheryDays * FisheryClock.RealMillisecondsPerFisheryDay);
	const { data: sales } = await trustedSupabase().from('carp_transfers').select('price, carp(weight_lb)').eq('kind', Sale).gte('departed_at', windowStart.toISOString());
	return (sales ?? []) as unknown as SaleRow[];
}

function hasFishStill(sale: SaleRow): sale is SaleRow & { carp: { weight_lb: number } } {
	return sale.carp !== null;
}

function saleForIndex(sale: SaleRow & { carp: { weight_lb: number } }): SaleForIndex {
	return { weightLb: Number(sale.carp.weight_lb), price: Number(sale.price) };
}
