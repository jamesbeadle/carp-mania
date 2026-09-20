<script lang="ts">
	import { pressureWariness, pressureWords } from '$lib/domain/water/pressure';

	let { recentCaptures }: { recentCaptures: number } = $props();

	const wariness = $derived(Math.round(pressureWariness(recentCaptures) * 100));
	const isWary = $derived(wariness > 0);
</script>

<span class="text-mist-400" class:text-danger-400={isWary}>· {pressureWords(recentCaptures)}{#if isWary}&nbsp;({wariness}% off its take){/if}</span>
