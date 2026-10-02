<script lang="ts">
	import type { AnglerToPin, Badge } from '$lib/contracts/Badges';
	import { BadgeCitation } from '$lib/domain/badges/badgeRules';

	let { badges, anglers }: { badges: Badge[]; anglers: AnglerToPin[] } = $props();

	const hasBadges = $derived(badges.length > 0);
</script>

<form method="POST" action="?/awardBadge" class="flex flex-col gap-3">
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Badge</span>
		<select name="badgeId" required class="field" disabled={!hasBadges}>
			{#each badges as badge (badge.id)}<option value={badge.id}>{badge.name}</option>{/each}
		</select>
	</label>
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Angler</span>
		<select name="anglerId" required class="field">
			{#each anglers as angler (angler.id)}<option value={angler.id}>{angler.name}</option>{/each}
		</select>
	</label>
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Citation (optional)</span>
		<textarea name="citation" maxlength={BadgeCitation.LongestLength} rows="2" class="field" placeholder="Why this angler, in a line"></textarea>
	</label>
	<button class="button-primary self-start" disabled={!hasBadges}>Pin it on</button>
</form>
