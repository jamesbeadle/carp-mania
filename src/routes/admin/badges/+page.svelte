<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import AwardBadgeForm from '$lib/components/badge/AwardBadgeForm.svelte';
	import BadgeRoll from '$lib/components/badge/BadgeRoll.svelte';
	import NewBadgeForm from '$lib/components/badge/NewBadgeForm.svelte';

	let { data, form } = $props();

	const desk = $derived(data.desk);
</script>

<svelte:head><title>The badge desk · Carp Mania</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<h1 class="text-4xl text-volt-300">The badge desk</h1>
		<p class="text-mist-400">Strike a badge, then pin it on any angler for whatever you think deserves it.</p>
	</div>
	<a href="/angler" class="ml-auto text-sm text-surge-400 hover:underline">← My angler</a>
</div>

<ActionMessage {form} />
<div class="grid gap-6 lg:grid-cols-[2fr_3fr]">
	<div class="space-y-6">
		<section class="panel">
			<h2 class="mb-3 text-xl text-volt-300">Strike a badge</h2>
			<NewBadgeForm />
		</section>
		<section class="panel">
			<h2 class="mb-3 text-xl text-volt-300">Pin one on</h2>
			<AwardBadgeForm badges={desk.badges} anglers={desk.anglers} />
		</section>
	</div>
	<section class="panel">
		<h2 class="mb-3 text-xl text-volt-300">The badges</h2>
		<BadgeRoll badges={desk.badges} />
	</section>
</div>
