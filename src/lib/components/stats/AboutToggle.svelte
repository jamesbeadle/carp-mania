<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title = 'About', children }: { title?: string; children: Snippet } = $props();
</script>

<details class="group text-xs text-mist-400">
	<summary class="cursor-pointer list-none font-display font-bold tracking-wide uppercase transition select-none hover:text-mist-100 [&::-webkit-details-marker]:hidden">{title} <span class="inline-block transition group-open:rotate-90">▸</span></summary>
	<div class="mt-1 max-w-prose leading-relaxed">{@render children()}</div>
</details>
