<script lang="ts">
	import type { BadgeWearer } from '$lib/contracts/Badges';
	import { formatWhen } from '$lib/format/dates';

	let { wearer }: { wearer: BadgeWearer } = $props();
</script>

<li class="flex flex-wrap items-baseline gap-x-3 py-1">
	<a href="/anglers/{wearer.anglerId}" class="text-mist-100 hover:underline">{wearer.anglerName}</a>
	{#if wearer.citation}<span class="text-mist-400">{wearer.citation}</span>{/if}
	<span class="ml-auto text-xs text-mist-400">{formatWhen(wearer.awardedAt)}</span>
</li>
