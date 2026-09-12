import type { WhileYouWereAway } from '$lib/contracts/WhileYouWereAway';
import type { Lake } from '$lib/domain/types';
import { netMoneyFor } from '$lib/domain/simulation/simulateOneDay';
import { formatMoney } from '$lib/format/money';

const QuietWords = ['All quiet on the bank.', 'Kettle is on. Nothing to report.', 'The water is as you left it.'];

export function bailiffsWord(lake: Pick<Lake, 'has_bailiff' | 'name'>, summary: WhileYouWereAway, dayOfMonth: number) {
	if (!lake.has_bailiff) return 'No bailiff on the books — the lodge stands empty between your visits.';
	if (summary.daysSimulated === 0) return QuietWords[dayOfMonth % QuietWords.length];
	const anglers = `${summary.anglersVisited} ${summary.anglersVisited === 1 ? 'angler' : 'anglers'}`;
	return `${anglers} through the gate, ${summary.fishCaught} fish out, ${formatMoney(netMoneyFor(summary))} after the bills.`;
}
