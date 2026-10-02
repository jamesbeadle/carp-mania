<script lang="ts">
	import type { BadgeHeld } from '$lib/contracts/Badges';
	import { formatWhen } from '$lib/format/dates';
	import BadgePin from './BadgePin.svelte';

	let { badge }: { badge: BadgeHeld } = $props();

	const story = $derived(badge.citation === '' ? badge.words : badge.citation);
</script>

<li class="flex items-center gap-3 rounded-xl border border-carbon-700 px-3 py-2">
	<BadgePin name={badge.name} metal={badge.metal} />
	<div class="min-w-0">
		<p class="font-display text-base font-bold tracking-wide text-volt-300 uppercase">{badge.name}</p>
		<p class="text-xs text-mist-300">{story}</p>
		<p class="text-xs text-mist-400">{formatWhen(badge.awardedAt)}</p>
	</div>
</li>
