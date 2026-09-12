<script lang="ts">
	import type { LabelledWork } from '$lib/contracts/MyGroundworks';
	import { formatWhen } from '$lib/format/dates';
	import { formatMoney } from '$lib/format/money';

	let { inProgress, ledger }: { inProgress: LabelledWork[]; ledger: LabelledWork[] } = $props();

	const daysLabel = (days: number) => `${days} ${days === 1 ? 'day' : 'days'}`;
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<section class="panel">
		<h3 class="mb-3 text-xl text-volt-300">Works in progress</h3>
		{#if inProgress.length === 0}
			<p class="text-sm text-mist-400">The diggers are idle. Order works from the editor.</p>
		{:else}
			<ul class="divide-y divide-carbon-700/60 text-sm">
				{#each inProgress as work (work.id)}
					<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
						<span class="text-mist-100">{work.label}</span>
						<span class="text-mist-400">{daysLabel(work.daysLeft)} left</span>
						<span class="text-volt-300">{formatMoney(work.cost)}</span>
						<form method="POST" action="?/cancelWorks" class="ml-auto">
							<input type="hidden" name="workId" value={work.id} />
							<button class="button-secondary px-3 py-1 text-base" title={work.refund > 0 ? 'Half the cost comes back within the first day' : 'The diggers have started; nothing comes back'}>
								Cancel{work.refund > 0 ? ` · ${formatMoney(work.refund)} back` : ''}
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
	<section class="panel">
		<h3 class="mb-3 text-xl text-volt-300">Works ledger</h3>
		{#if ledger.length === 0}
			<p class="text-sm text-mist-400">Nothing built yet.</p>
		{:else}
			<ul class="divide-y divide-carbon-700/60 text-sm">
				{#each ledger as work (work.id)}
					<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
						<span class="text-mist-100">{work.label}</span>
						<span class:text-mist-400={work.status === 'complete'} class:text-danger-400={work.status === 'cancelled'}>{work.status === 'complete' ? 'finished' : 'cancelled'}</span>
						<span class="ml-auto text-volt-300">{formatMoney(work.cost)}</span>
						<span class="text-xs text-mist-400">{formatWhen(work.ordered_at)}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
