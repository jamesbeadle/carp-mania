<script lang="ts">
	import { craftOf } from '$lib/domain/anglerRating';
	import type { RodSetup } from '$lib/domain/tackle/rodSetup';
	import type { OwnedTackle } from '$lib/domain/tackle/tackleBox';
	import type { Lake, Profile, Swim } from '$lib/domain/types';
	import type { SessionState } from '$lib/game/session/sessionState.svelte';
	import { skillsOfProfile } from '$lib/game/session/skillsOfProfile';
	import TackleBuilder from './TackleBuilder.svelte';

	interface Props {
		session: SessionState;
		swim: Swim;
		lake: Lake;
		profile: Profile;
		owned: OwnedTackle[];
		onReady: (setups: RodSetup[]) => void;
	}

	let { session, swim, lake, profile, owned, onReady }: Props = $props();

	const craft = $derived(craftOf(skillsOfProfile(profile)));
	const savedRods = $derived(profile.saved_rods ?? []);
	const carpCount = $derived(session.carp.length);
</script>

<div class="h-full overflow-y-auto px-4 py-6">
	<div class="mx-auto max-w-5xl">
		<TackleBuilder {lake} {swim} season={session.season} rating={session.rating} {craft} {carpCount} {savedRods} {owned} {onReady} />
	</div>
</div>
