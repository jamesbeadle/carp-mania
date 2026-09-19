<script lang="ts">
	import type { TackleMatch } from '$lib/domain/fishing/tackleMatch';

	let { match }: { match: TackleMatch } = $props();

	const percent = (score: number) => `${Math.round(score * 100)}%`;
</script>

<dl class="grid grid-cols-5 gap-1 text-center text-xs">
	<div><dt class="text-mist-400">Line</dt><dd>{percent(match.line)}</dd></div>
	<div><dt class="text-mist-400">Hook</dt><dd>{percent(match.hook)}</dd></div>
	<div><dt class="text-mist-400">Rig</dt><dd>{percent(match.rig)}</dd></div>
	<div><dt class="text-mist-400">Bait</dt><dd>{percent(match.bait)}</dd></div>
	<div><dt class="text-mist-400">Tubing</dt><dd>{percent(match.tubing)}</dd></div>
</dl>
<p class="text-center text-sm">Overall match <span class="font-semibold text-volt-300">{percent(match.overall)}</span></p>
