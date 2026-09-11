import type { RodSetup } from '$lib/domain/tackle/rodSetup';

export async function rememberRodSetups(lakeId: string, setups: RodSetup[]) {
	const response = await fetch(`/fish/${lakeId}/rods`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(setups)
	});
	return response.ok;
}
