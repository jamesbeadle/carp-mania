export const Paging = { FirstPage: 1 } as const;

export interface PageOfList {
	number: number;
	size: number;
}

export interface ListPage<Item> {
	items: Item[];
	total: number;
	number: number;
	count: number;
}

export function pageNumberFrom(param: string | null) {
	const wanted = Number(param);
	return Number.isInteger(wanted) && wanted >= Paging.FirstPage ? wanted : Paging.FirstPage;
}

export function rangeOf(page: PageOfList): { from: number; to: number } {
	const from = (page.number - Paging.FirstPage) * page.size;
	return { from, to: from + page.size - 1 };
}

export function pageCountOf(total: number, size: number) {
	return Math.max(Paging.FirstPage, Math.ceil(total / size));
}

export function clampedPage(page: PageOfList, total: number): PageOfList {
	return { ...page, number: Math.min(page.number, pageCountOf(total, page.size)) };
}

export function listPageOf<Item>(items: Item[], total: number, page: PageOfList): ListPage<Item> {
	return { items, total, number: clampedPage(page, total).number, count: pageCountOf(total, page.size) };
}

export function hasMorePages(page: ListPage<unknown>) {
	return page.count > Paging.FirstPage;
}
