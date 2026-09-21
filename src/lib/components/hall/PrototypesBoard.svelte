<script lang="ts">
	import type { PrototypeOnTheBoard } from '$lib/contracts/Prototypes';
	import { formatWhen } from '$lib/format/dates';

	let { prototypes }: { prototypes: PrototypeOnTheBoard[] } = $props();

	function whenWords(prototype: PrototypeOnTheBoard) {
		const { isDestroyed, destroyedAt, wonAt } = prototype;
		if (isDestroyed && destroyedAt) return `snapped ${formatWhen(destroyedAt)}`;
		return `won ${formatWhen(wonAt)}`;
	}
</script>

<section class="panel">
	<h2 class="text-xl text-volt-300">The prototypes</h2>
	<p class="mb-3 text-xs text-mist-400">One of one, each. Never sold, and struck from the board the day one snaps.</p>
	{#if prototypes.length === 0}
		<p class="text-sm text-mist-400">None has been won yet.</p>
	{:else}
		<ul class="divide-y divide-carbon-700/60 text-sm">
			{#each prototypes as prototype (prototype.itemId)}
				{@const { isDestroyed, holderId, holderName, label } = prototype}
				<li class="flex flex-wrap items-baseline gap-2 py-2" class:opacity-60={isDestroyed}>
					<span class="font-medium text-mist-100" class:line-through={isDestroyed}>{label}</span>
					{#if holderId}<a href="/anglers/{holderId}" class="text-surge-400 hover:underline">{holderName}</a>{:else}<span>{holderName}</span>{/if}
					<span class="ml-auto text-xs text-mist-400">{whenWords(prototype)}</span>
				</li>
			{/each}
		</ul>
	{/if}
</section>
