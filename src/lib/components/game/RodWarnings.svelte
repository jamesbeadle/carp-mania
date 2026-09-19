<script lang="ts">
	import { landsUpToLb } from '$lib/domain/tackle/rods';
	import type { RodKit } from '$lib/domain/tackle/rodSetup';
	import { whatIsShortFor, type OwnedItem } from '$lib/domain/tackle/tackleBox';

	let { kit, box }: { kit: RodKit; box: OwnedItem[] } = $props();

	const FortyLb = 40;
	const short = $derived(whatIsShortFor(box, kit));
	const isLight = $derived(landsUpToLb(kit.rod.rod) < FortyLb);
</script>

{#if isLight}<p class="text-xs text-danger-400">This rod will not land a forty — anything over {landsUpToLb(kit.rod.rod)} lb risks snapping it.</p>{/if}
{#if short.length > 0}<p class="text-xs text-danger-400">Out of {short.join(', ')} — <a href="/market/tackle" class="underline">stock up at the counter</a> before you fish this rod.</p>{/if}
