<script lang="ts">
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { willingnessToPayFor } from '$lib/domain/simulation/visitingAnglers';
	import type { Lake } from '$lib/domain/types';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';

	let { lake }: { lake: Lake } = $props();

	const DayTicket = { MinimumFee: 0, MaximumFee: 250 } as const;
	let typedFee = $state<number | null>(null);
	const fee = $derived(typedFee ?? Number(lake.day_ticket_fee));
	const willingness = $derived(willingnessToPayFor(Number(lake.reputation), lake.region));
	const isPricey = $derived(fee > willingness);
</script>

<section class="panel mx-auto max-w-2xl">
	<p class="stat-label">The last step</p>
	<h2 class="mb-1 text-2xl text-volt-300">Open the gates</h2>
	<p class="mb-4 text-sm text-mist-400">
		Until the gates open {lake.name} is private: no anglers, no takings, no catches, nothing on the globe. Set a day ticket and go public when you are ready and not before.
	</p>
	<form method="POST" action="?/open">
		<label class="block">
			<span class="stat-label">Day ticket fee (£)</span>
			<input name="fee" type="number" min={DayTicket.MinimumFee} max={DayTicket.MaximumFee} step="1" value={fee} oninput={(event) => (typedFee = Number(event.currentTarget.value))} class="field mt-1 text-2xl" />
		</label>
		<p class="mt-2 text-sm" class:text-mist-400={!isPricey} class:text-danger-400={isPricey}>
			At reputation {Math.round(Number(lake.reputation))}, anglers in {RegionCatalogue[lake.region].label} will pay up to about {formatMoney(willingness)}.
			{#if isPricey}Price above that and fewer turn up.{/if}
		</p>
		<footer class="mt-6 flex items-center gap-3">
			<a href="?step={WizardStep.Stock}" class="button-secondary">← Back</a>
			<button class="button-primary ml-auto">Open the gates</button>
		</footer>
	</form>
</section>
