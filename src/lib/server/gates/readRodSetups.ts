import { fail } from '@sveltejs/kit';
import { BaitNames } from '$lib/domain/tackle/baits';
import { HookFinishes, HookSizes } from '$lib/domain/tackle/hooks';
import { LineColours, LineThicknesses } from '$lib/domain/tackle/lines';
import { RigNames } from '$lib/domain/tackle/rigs';
import { MaximumRods, type RodSetup } from '$lib/domain/tackle/rodSetup';
import { TubingColours } from '$lib/domain/tackle/tubing';

export function readRodSetups(candidate: unknown) {
	const isList = Array.isArray(candidate) && candidate.length >= 1 && candidate.length <= MaximumRods;
	if (!isList) return { setups: null, failure: fail(400, { message: `Send between 1 and ${MaximumRods} rods` }) };
	const setups = (candidate as unknown[]).filter(isRodSetup);
	if (setups.length !== candidate.length) return { setups: null, failure: fail(400, { message: 'A rod setup had a choice that is not in the catalogue' }) };
	return { setups, failure: null };
}

function isRodSetup(candidate: unknown): candidate is RodSetup {
	const setup = candidate as RodSetup;
	return (
		isOneOf(setup?.line?.colour, LineColours) &&
		isOneOf(setup?.line?.thickness, LineThicknesses) &&
		isOneOf(setup?.hook?.size, HookSizes) &&
		isOneOf(setup?.hook?.finish, HookFinishes) &&
		isOneOf(setup?.rig, RigNames) &&
		isOneOf(setup?.bait, BaitNames) &&
		isOneOf(setup?.tubing, TubingColours)
	);
}

function isOneOf<Choice>(value: unknown, choices: readonly Choice[]) {
	return (choices as readonly unknown[]).includes(value);
}
