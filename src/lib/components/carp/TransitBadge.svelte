<script lang="ts">
	import type { Carp } from '$lib/domain/types';
	import { formatWhen } from '$lib/format/dates';

	let { carp }: { carp: Pick<Carp, 'transit_until' | 'quarantine_until'> } = $props();
</script>

{#if carp.transit_until}
	<span class="rounded-full border border-surge-500/40 bg-surge-500/10 px-2 py-0.5 text-xs whitespace-nowrap text-surge-300">In transit · arrives {formatWhen(carp.transit_until)}</span>
{:else if carp.quarantine_until}
	<span class="rounded-full border border-silt-500/60 bg-silt-700/40 px-2 py-0.5 text-xs whitespace-nowrap text-mist-200">In quarantine until {formatWhen(carp.quarantine_until)}</span>
{/if}
