export type TabId = 'lake' | 'fish' | 'world' | 'market' | 'me';

export interface MainTab {
	id: TabId;
	label: string;
	href: string;
	paths: string[];
}

export const MainTabs: MainTab[] = [
	{ id: 'lake', label: 'My lake', href: '/home', paths: ['/home', '/lake'] },
	{ id: 'fish', label: 'Go fishing', href: '/lakes', paths: ['/lakes', '/fish'] },
	{ id: 'world', label: 'The world', href: '/world', paths: ['/world', '/anglers', '/carp'] },
	{ id: 'market', label: 'Market', href: '/market', paths: ['/market'] },
	{ id: 'me', label: 'My angler', href: '/angler', paths: ['/angler'] }
];

export function isTabCurrent(tab: MainTab, pathname: string) {
	return tab.paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
