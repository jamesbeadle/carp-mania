const FameTiers = [
	{ from: 60, label: 'Legend' },
	{ from: 30, label: 'Famous' },
	{ from: 10, label: 'Well known' },
	{ from: 1, label: 'Known' },
	{ from: 0, label: 'Unknown' }
] as const;

const UnknownTier = 'Unknown';

export function fameTierOf(fame: number): string {
	const tier = FameTiers.find((candidate) => fame >= candidate.from);
	return tier?.label ?? UnknownTier;
}
