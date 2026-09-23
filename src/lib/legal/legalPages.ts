export interface LegalSection {
	heading: string;
	paragraphs: string[];
}

export interface LegalDocument {
	title: string;
	summary: string;
	updatedOn: string;
	sections: LegalSection[];
}

export interface LegalPageLink {
	path: string;
	label: string;
}

export const LegalContact = {
	email: 'consulting@yourbusiness.today',
	site: 'carp-mania.com',
	minimumAge: 13,
	updatedOn: '23 September 2026'
} as const;

export const LegalPages: LegalPageLink[] = [
	{ path: '/privacy', label: 'Privacy' },
	{ path: '/terms', label: 'Terms' }
];
