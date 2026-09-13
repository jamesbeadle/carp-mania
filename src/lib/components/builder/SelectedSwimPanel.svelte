<script lang="ts">
	import { whySwimIsRefused } from '$lib/domain/groundworks/swimPlacement';
	import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
	import { SwimRules } from '$lib/domain/layout/swimRules';
	import type { Lake, Swim } from '$lib/domain/types';
	import { formatMoney } from '$lib/format/money';
	import { pointerWords } from '$lib/game/stage/pointerWords';

	let { lake, swims, swim, movePoint }: { lake: Lake; swims: Swim[]; swim: Swim; movePoint: LayoutPoint | null } = $props();

	const others = $derived(swims.filter((candidate) => candidate.id !== swim.id));
	const moveRefusal = $derived(movePoint ? whySwimIsRefused(lake, others, movePoint, 'move') : null);
	const moveWords = $derived(pointerWords(`Click or drag to a spot on the bank to move it for ${formatMoney(SwimRules.MoveCost)}.`));
</script>

<div class="flex flex-wrap items-center gap-x-4 gap-y-3">
	<p class="font-display text-lg font-bold text-mist-100 uppercase">{swim.name}</p>
	<form method="POST" action="?/renameSwim" class="flex gap-2">
		<input type="hidden" name="swimId" value={swim.id} />
		<input name="name" class="field w-44" value={swim.name} minlength="2" maxlength="30" aria-label="Swim name" />
		<button class="button-secondary px-3 text-base">Rename</button>
	</form>
	{#if movePoint}
		<form method="POST" action="?/moveSwim" class="flex items-center gap-2">
			<input type="hidden" name="swimId" value={swim.id} />
			<input type="hidden" name="x" value={movePoint.x} />
			<input type="hidden" name="y" value={movePoint.y} />
			{#if moveRefusal}<p class="text-sm text-danger-400">{moveRefusal}</p>{/if}
			<button class="button-primary px-3 text-base" disabled={moveRefusal !== null}>Move here {formatMoney(SwimRules.MoveCost)}</button>
		</form>
	{:else}
		<p class="text-xs text-mist-400">{moveWords}</p>
	{/if}
	<form method="POST" action="?/removeSwim" class="ml-auto">
		<input type="hidden" name="swimId" value={swim.id} />
		<button class="button-secondary px-3 text-base">Take out {formatMoney(SwimRules.RemoveCost)}</button>
	</form>
</div>
