import { Paging } from './paging';

export type ListParams = Record<string, string | number | null | undefined>;

const PageParam = 'page';

export function listPathFor(basePath: string, params: ListParams, page: number = Paging.FirstPage) {
	const query = listQueryOf(params, page);
	return query === '' ? basePath : `${basePath}?${query}`;
}

export function actionPathFor(actionName: string, params: ListParams, page: number = Paging.FirstPage) {
	const query = listQueryOf(params, page);
	return query === '' ? `?/${actionName}` : `?/${actionName}&${query}`;
}

function listQueryOf(params: ListParams, page: number) {
	const search = new URLSearchParams();
	for (const [name, value] of Object.entries(params)) {
		if (value === null || value === undefined || value === '') continue;
		search.set(name, String(value));
	}
	if (page !== Paging.FirstPage) search.set(PageParam, String(page));
	return search.toString();
}
