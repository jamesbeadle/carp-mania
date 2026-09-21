import { error } from '@sveltejs/kit';

const HttpStatus = { BadRequest: 400 } as const;

export function readSetId(candidate: unknown): string {
	const setId = (candidate as { setId?: unknown } | null)?.setId;
	if (typeof setId !== 'string' || setId === '') error(HttpStatus.BadRequest, 'Which set?');
	return setId;
}
