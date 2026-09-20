<script lang="ts">
	import { hourWords, weatherWords } from '$lib/domain/fishing/weatherConditions';
	import type { Weather } from '$lib/domain/world/weather';

	let { weather, hour }: { weather: Weather; hour: number } = $props();

	const sky = $derived(weatherWords(weather));
	const light = $derived(hourWords(hour));
</script>

<span class="short:hidden basis-full text-xs text-mist-200 sm:basis-auto">
	<span>{sky}.</span>
	<span class="hidden sm:inline">{light}.</span>
</span>
