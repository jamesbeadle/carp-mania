import { fail } from '@sveltejs/kit';
import { isRodSetup, MaximumRods } from '$lib/domain/tackle/rodSetup';

export function readRodSetups(candidate: unknown) {
	const isList = Array.isArray(candidate) && candidate.length >= 1 && candidate.length <= MaximumRods;
	if (!isList) return { setups: null, failure: fail(400, { message: `Send between 1 and ${MaximumRods} rods` }) };
	const setups = (candidate as unknown[]).filter(isRodSetup);
	if (setups.length !== candidate.length) return { setups: null, failure: fail(400, { message: 'A rod setup had a choice that is not in the catalogue' }) };
	return { setups, failure: null };
}
