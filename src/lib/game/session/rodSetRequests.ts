import type { RodSetSaved, SaveRodSetOrder } from '$lib/contracts/RodSets';

const SetsPath = '/tackle/sets';
const JsonHeaders = { 'content-type': 'application/json' };

async function post(path: string, body: unknown) {
	return fetch(path, { method: 'POST', headers: JsonHeaders, body: JSON.stringify(body) });
}

export async function saveRodSet(order: SaveRodSetOrder): Promise<RodSetSaved | string> {
	const response = await post(SetsPath, order);
	if (response.ok) return (await response.json()) as RodSetSaved;
	const body = (await response.json().catch(() => null)) as { message?: string } | null;
	return body?.message ?? 'The set was not saved';
}

export async function dropRodSet(setId: string) {
	const response = await post(`${SetsPath}/drop`, { setId });
	return response.ok;
}

export async function markRodSetUsed(setId: string) {
	const response = await post(`${SetsPath}/used`, { setId });
	return response.ok;
}
