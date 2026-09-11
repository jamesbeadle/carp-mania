import { fail } from '@sveltejs/kit';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Swim } from '$lib/domain/types';
import { readFormNumber } from '../gates/readFormNumber';

export const SwimName = { MinimumLength: 2, MaximumLength: 30 } as const;
const SceneFraction = { Minimum: 0, Maximum: 1 } as const;

export function readSwimPoint(formData: FormData) {
	const x = readFormNumber(formData, 'x', SceneFraction.Minimum, SceneFraction.Maximum);
	if (x.failure) return { point: null, failure: x.failure };
	const y = readFormNumber(formData, 'y', SceneFraction.Minimum, SceneFraction.Maximum);
	if (y.failure) return { point: null, failure: y.failure };
	const point: LayoutPoint = { x: x.value, y: y.value };
	return { point, failure: null };
}

export function readSwimName(formData: FormData, otherSwims: Pick<Swim, 'name'>[]) {
	const name = String(formData.get('name') ?? '').trim();
	const isValidLength = name.length >= SwimName.MinimumLength && name.length <= SwimName.MaximumLength;
	if (!isValidLength) return { name: null, failure: fail(400, { message: `A swim's name must be ${SwimName.MinimumLength}–${SwimName.MaximumLength} characters` }) };
	const isTaken = otherSwims.some((swim) => swim.name.toLowerCase() === name.toLowerCase());
	if (isTaken) return { name: null, failure: fail(400, { message: `There is already a swim called ${name}` }) };
	return { name, failure: null };
}

export async function loadSwimsOf(locals: App.Locals, lakeId: string): Promise<Swim[]> {
	const { data: swims } = await locals.supabase.from('swims').select('*').eq('lake_id', lakeId).order('name');
	return (swims ?? []) as Swim[];
}

export function findSwim(swims: Swim[], formData: FormData) {
	const swimId = String(formData.get('swimId') ?? '');
	const swim = swims.find((candidate) => candidate.id === swimId) ?? null;
	if (!swim) return { swim: null, others: swims, failure: fail(400, { message: 'That swim is not on your water' }) };
	return { swim, others: swims.filter((candidate) => candidate.id !== swim.id), failure: null };
}
