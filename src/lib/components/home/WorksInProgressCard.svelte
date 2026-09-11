<script lang="ts">
	import { GroundworksCatalogue } from '$lib/domain/groundworks/catalogue';
	import { isWorkKind } from '$lib/domain/groundworks/workKinds';
	import { FisheryClock } from '$lib/domain/simulation/elapsedDays';
	import type { LakeWork } from '$lib/domain/worldTypes';
	import { formatWhen } from '$lib/format/dates';
	import { humanise } from '$lib/format/labels';
	import { formatMoney } from '$lib/format/money';

	let { works }: { works: LakeWork[] } = $props();

	const labelOf = (work: LakeWork) => (isWorkKind(work.kind) ? GroundworksCatalogue[work.kind].label : humanise(work.kind));
	const daysLeftOf = (work: LakeWork) => {
		const millisecondsLeft = new Date(work.completes_on).getTime() - Date.now();
		return Math.max(0, Math.ceil(millisecondsLeft / FisheryClock.RealMillisecondsPerFisheryDay));
	};
	const daysWord = (days: number) => (days === 1 ? 'day' : 'days');
</script>

{#if works.length > 0}
	<section class="panel">
		<p class="stat-label">Works in progress</p>
		<h2 class="mb-4 text-3xl text-volt-300">{works.length} on the go</h2>
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each works as work (work.id)}
				{@const daysLeft = daysLeftOf(work)}
				<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
					<span class="text-mist-100">{labelOf(work)}</span>
					<span class="text-mist-400">{formatMoney(work.cost)}</span>
					<span class="ml-auto text-volt-300">{daysLeft} {daysWord(daysLeft)} left</span>
					<span class="text-xs text-mist-400">done {formatWhen(work.completes_on)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-5 flex gap-3">
			<a href="/lake" class="button-secondary">The plan</a>
		</div>
	</section>
{/if}
