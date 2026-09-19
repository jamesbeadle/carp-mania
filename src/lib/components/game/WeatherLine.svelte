<script lang="ts">
	import { hourWords, weatherWords } from '$lib/domain/fishing/weatherConditions';
	import type { Weather } from '$lib/domain/world/weather';

	let { weather, hour }: { weather: Weather; hour: number } = $props();

	const words = $derived(`${weatherWords(weather)}. ${hourWords(hour)}.`);
</script>

<p class="pointer-events-none rounded-lg border border-carbon-700 bg-carbon-950/80 px-3 py-1.5 text-xs text-mist-200 backdrop-blur">{words}</p>
