import { pageNumberFrom } from './paging';

export interface InboxFilters {
	isUnreadOnly: boolean;
	page: number;
}

export const InboxListing = { PageSize: 18 } as const;

const ShowParam = 'show';
const UnreadOnly = 'unread';

export function inboxFiltersFrom(params: URLSearchParams): InboxFilters {
	return { isUnreadOnly: params.get(ShowParam) === UnreadOnly, page: pageNumberFrom(params.get('page')) };
}

export function inboxParamsOf(filters: InboxFilters) {
	return { [ShowParam]: filters.isUnreadOnly ? UnreadOnly : null };
}
