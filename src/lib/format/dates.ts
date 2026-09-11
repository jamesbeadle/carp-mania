const ShortDateTime = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export function formatWhen(isoTimestamp: string) {
	return ShortDateTime.format(new Date(isoTimestamp));
}
