import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { feedGroupFrom, FeedWindow } from '$lib/domain/world/feedGroups';
import { GetWorldActivity } from '$lib/server/queries/GetWorldActivity';

const BeforeParam = 'before';
const GroupParam = 'group';

export const GET: RequestHandler = async ({ locals, url }) => {
	const before = url.searchParams.get(BeforeParam)?.slice(0, FeedWindow.LongestBefore) ?? null;
	const group = feedGroupFrom(url.searchParams.get(GroupParam));
	return json(await GetWorldActivity(locals, { limit: FeedWindow.PageSize, before, group }));
};
