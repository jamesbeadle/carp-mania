<script lang="ts">
	import type { Lake, Profile } from '$lib/domain/types';
	import type { CatchReportOutcome, LandedFish } from '$lib/game/session/landFish';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import CatchPhoto from './CatchPhoto.svelte';

	interface Props {
		session: SessionState;
		landed: LandedFish;
		lake: Lake;
		profile: Profile;
		catchOutcome: CatchReportOutcome | null;
		onContinue: () => void;
	}

	let { session, landed, lake, profile, catchOutcome, onContinue }: Props = $props();

	const isSettling = $derived(session.isSettlingAfterCatch);
</script>

<CatchPhoto {landed} anglerName={profile.display_name} lakeName={lake.name} {catchOutcome} {isSettling} {onContinue} />
