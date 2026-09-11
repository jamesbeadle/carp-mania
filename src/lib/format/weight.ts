const OuncesPerPound = 16;

export function formatWeight(pounds: number | string) {
	const total = Number(pounds);
	const wholePounds = Math.floor(total);
	const ounces = Math.round((total - wholePounds) * OuncesPerPound);
	if (ounces === OuncesPerPound) return `${wholePounds + 1} lb`;
	return ounces === 0 ? `${wholePounds} lb` : `${wholePounds} lb ${ounces} oz`;
}
