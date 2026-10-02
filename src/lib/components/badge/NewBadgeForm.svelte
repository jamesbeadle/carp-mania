<script lang="ts">
	import { BadgeMetalLabels, BadgeMetals, BadgeName, BadgeWords, badgeNameRuleWords } from '$lib/domain/badges/badgeRules';
</script>

<form method="POST" action="?/createBadge" class="flex flex-col gap-3">
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Name</span>
		<input name="name" minlength={BadgeName.ShortestLength} maxlength={BadgeName.LongestLength} required class="field" placeholder="Silver Carp" />
	</label>
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>What it is for</span>
		<textarea name="words" maxlength={BadgeWords.LongestLength} rows="2" class="field" placeholder="Pinned on by the keeper for…"></textarea>
	</label>
	<label class="flex flex-col gap-1 text-xs text-mist-400">
		<span>Metal</span>
		<select name="metal" class="field">
			{#each BadgeMetals as metal (metal)}<option value={metal}>{BadgeMetalLabels[metal]}</option>{/each}
		</select>
	</label>
	<p class="text-xs text-mist-400">A name is {badgeNameRuleWords()} and no two badges share one.</p>
	<button class="button-primary self-start">Strike the badge</button>
</form>
