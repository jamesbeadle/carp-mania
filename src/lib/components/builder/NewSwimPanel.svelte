<script lang="ts">
	import { whySwimIsRefused } from '$lib/domain/groundworks/swimPlacement';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import { SwimRules } from '$lib/domain/layout/swimRules';
	import type { Lake, Swim } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { lake, swims, point }: { lake: Lake; swims: Swim[]; point: LayoutPoint } = $props();

	const refusal = $derived(whySwimIsRefused(lake, swims, point, 'build'));
</script>

<form method="POST" action="?/addSwim" class="space-y-2 border-t border-carbon-700 pt-3">
	<input type="hidden" name="x" value={point.x} />
	<input type="hidden" name="y" value={point.y} />
	<label>
		<span class="stat-label">Swim name</span>
		<input name="name" class="field" placeholder="The Point" required minlength="2" maxlength="30" />
	</label>
	{#if refusal}<p class="text-sm text-danger-400">{refusal}</p>{/if}
	<p class="text-xs text-mist-400">A new peg is built the same day. {swims.length} swims on the bank now.</p>
	<button class="button-primary w-full px-2 text-base" disabled={refusal !== null}>Build swim {formatMoney(SwimRules.BuildCost)}</button>
</form>
