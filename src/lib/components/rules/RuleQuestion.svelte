<script lang="ts">
	import type { RuleQuestion } from '$lib/rules/ruleBookTypes';

	let { entry, isOpen = false }: { entry: RuleQuestion; isOpen?: boolean } = $props();
</script>

<details class="group border-t border-carbon-700/60 py-2 first:border-t-0" open={isOpen}>
	<summary class="flex cursor-pointer list-none items-start gap-3 py-1 text-base text-mist-100 hover:text-volt-300 [&::-webkit-details-marker]:hidden">
		<span class="mt-1 shrink-0 font-display text-sm font-bold text-surge-400 transition group-open:rotate-90">▸</span>
		<span>{entry.question}</span>
	</summary>
	<p class="pb-2 pl-7 text-sm leading-relaxed text-mist-200">{entry.answer}</p>
</details>
