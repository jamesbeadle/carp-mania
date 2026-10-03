import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { lookFromCode } from '$lib/domain/portrait/portraitLook';
import { drawPortrait } from '$lib/game/portrait/drawPortrait';

const KeptForAYear = 'public, max-age=31536000, immutable';
const HttpStatus = { NotFound: 404 } as const;

export const GET: RequestHandler = ({ params }) => {
	const look = lookFromCode(params.look);
	if (!look) error(HttpStatus.NotFound, 'No such portrait');
	return new Response(drawPortrait(look), { headers: { 'content-type': 'image/svg+xml', 'cache-control': KeptForAYear } });
};
