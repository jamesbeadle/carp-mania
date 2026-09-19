<script lang="ts">
	import type { Candidate } from '$lib/domain/bailiffs/candidates';
	import { formatMoney } from '$lib/format/money';

	let { candidate, isFull }: { candidate: Candidate; isFull: boolean } = $props();
</script>

<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
	<span class="font-medium text-mist-100">{candidate.name}</span>
	<span class="text-xs text-mist-400">asks {formatMoney(candidate.askingWage)} a day</span>
	<span class="text-xs text-mist-200">“{candidate.reference}”</span>
	<form method="POST" action="?/hireBailiff" class="ml-auto">
		<input type="hidden" name="candidateId" value={candidate.id} />
		<button class="button-primary px-3 py-1 text-base" disabled={isFull} title={isFull ? 'The team is full for a water this size' : `Hire ${candidate.name}`}>Hire</button>
	</form>
</li>
