<script lang="ts">
	import { BaitCatalogue } from '$lib/domain/tackle/baits';
	import { pairingScore, PairingScore, PresentationLabels } from '$lib/domain/tackle/presentations';
	import { RigCatalogue } from '$lib/domain/tackle/rigs';
	import { landsUpToLb } from '$lib/domain/tackle/rods';
	import type { RodKit } from '$lib/domain/tackle/rodSetup';
	import { whatIsShortFor, type OwnedItem } from '$lib/domain/tackle/tackleBox';

	let { kit, box }: { kit: RodKit; box: OwnedItem[] } = $props();

	const FortyLb = 40;
	const short = $derived(whatIsShortFor(box, kit));
	const isLight = $derived(landsUpToLb(kit.rod.rod) < FortyLb);
	const presentation = $derived(BaitCatalogue[kit.bait.bait.kind].presentation);
	const pairing = $derived(pairingScore(RigCatalogue[kit.rig.rig], presentation));
	const isWrongPairing = $derived(pairing < PairingScore.Matched);
</script>

{#if isLight}<p class="text-xs text-danger-400">This rod will not land a forty — anything over {landsUpToLb(kit.rod.rod)} lb risks snapping it.</p>{/if}
{#if isWrongPairing}<p class="text-xs text-danger-400">Wrong pairing — a {PresentationLabels[presentation].toLowerCase()} on a {kit.rig.label.toLowerCase()} {pairing === PairingScore.Tolerable ? 'fishes, but badly' : 'barely fishes at all'}. {RigCatalogue[kit.rig.rig].behaviour}.</p>{/if}
{#if short.length > 0}<p class="text-xs text-danger-400">Out of {short.join(', ')} — <a href="/market/tackle" class="underline">stock up at the counter</a> before you fish this rod.</p>{/if}
