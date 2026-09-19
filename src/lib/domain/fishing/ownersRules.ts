import { kitOf, type RodSetup } from '../tackle/rodSetup';
import type { Lake } from '../types';

const BarbedBanned = 'Barbed hooks are banned on this water — tie on a barbless or micro-barbed hook';

export function whyTheOwnerRefusesRod(lake: Pick<Lake, 'is_barbed_banned'>, setup: RodSetup): string | null {
	const kit = kitOf(setup);
	if (!kit) return null;
	const isBarbed = kit.hook.hook.barb === 'barbed';
	if (lake.is_barbed_banned && isBarbed) return BarbedBanned;
	return null;
}

export function whyTheOwnerRefusesRods(lake: Pick<Lake, 'is_barbed_banned'>, setups: RodSetup[]): string | null {
	return setups.map((setup) => whyTheOwnerRefusesRod(lake, setup)).find((reason) => reason !== null) ?? null;
}
