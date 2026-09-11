const PoundsSterling = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });

export function formatMoney(amount: number | string) {
	return PoundsSterling.format(Number(amount));
}
