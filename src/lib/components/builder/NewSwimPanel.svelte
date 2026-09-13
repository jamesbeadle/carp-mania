<script lang="ts">
	import { whySwimIsRefused } from '$lib/domain/groundworks/swimPlacement';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import { SwimRules } from '$lib/domain/layout/swimRules';
	import type { Lake, Swim } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';

	let { lake, swims, point }: { lake: Lake; swims: Swim[]; point: LayoutPoint } = $props();

	const refusal = $derived(whySwimIsRefused(lake, swims, point, 'build'));
</script>

<form method="POST" action="?/addSwim" class="flex flex-wrap items-center gap-x-4 gap-y-2">
	<input type="hidden" name="x" value={point.x} />
	<input type="hidden" name="y" value={point.y} />
	<label class="flex items-center gap-2">
		<span class="stat-label">New swim</span>
		<input name="name" class="field w-44" placeholder="The Point" required minlength="2" maxlength="30" />
	</label>
	{#if refusal}<p class="text-sm text-danger-400">{refusal}</p>{:else}<p class="text-xs text-mist-400">Built the same day. {swims.length} swims on the bank now.</p>{/if}
	<button class="button-primary ml-auto px-3 text-base" disabled={refusal !== null}>Build swim {formatMoney(SwimRules.BuildCost)}</button>
</form>
