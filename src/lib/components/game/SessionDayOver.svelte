<script lang="ts">
	import { formatFishingHour } from '$lib/domain/fishing/sessionClock';
	import type { Lake } from '$lib/domain/types';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import DayOverSummary from './DayOverSummary.svelte';

	let { session, lake }: { session: SessionState; lake: Lake } = $props();

	const { landedToday, lostToday, nuisanceToday, visitId, sessionsLeft, window } = $derived(session);
	const endWords = $derived(formatFishingHour(window.toHour));
</script>

<DayOverSummary landed={landedToday} lost={lostToday} nuisance={nuisanceToday} lakeId={lake.id} {visitId} {sessionsLeft} {endWords} />
