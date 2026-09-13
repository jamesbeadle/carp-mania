<script lang="ts">
	import { LegalPages } from '$lib/legal/legalPages';
	import MeshBackdrop from './brand/MeshBackdrop.svelte';
	import Wordmark from './brand/Wordmark.svelte';

	let { hasSignInError }: { hasSignInError: boolean } = $props();
</script>

<section class="relative mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-carbon-700 bg-carbon-950 px-6 py-16 text-center">
	<MeshBackdrop opacity={0.45} />
	<div class="relative">
		<p class="stat-label mb-4">A fishery you run. A lake you fish.</p>
		<h1 class="mb-6 text-7xl leading-none"><Wordmark size="text-7xl" /></h1>
		<p class="mx-auto mb-10 max-w-xl text-lg text-mist-200">
			Ten acres, a hundred carp. Feed them right, keep the water sweet, and the anglers who come will catch the fish that
			make your name — then take your own rods to any water in the game.
		</p>
		<form method="POST" action="?/signInWithGoogle">
			<button class="button-primary px-10 py-3 text-2xl">Sign in with Google</button>
		</form>
		{#if hasSignInError}
			<p class="mt-4 text-danger-400">Sign-in didn't complete — try again.</p>
		{/if}
		<p class="mt-10 text-xs text-mist-400">
			Free to play, no adverts. {#each LegalPages as page, index (page.path)}{#if index > 0}{' · '}{/if}<a href={page.path} class="hover:text-mist-100 hover:underline">{page.label}</a>{/each}
		</p>
	</div>
</section>
