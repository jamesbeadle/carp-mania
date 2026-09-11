<script lang="ts">
	let { hasSignInError }: { hasSignInError: boolean } = $props();
</script>

<section class="mx-auto mt-16 max-w-2xl text-center">
	<p class="stat-label mb-3">A fishery you run. A lake you fish.</p>
	<h1 class="mb-6 text-6xl text-gold-300">Carp Mania</h1>
	<p class="mb-10 text-lg text-mist-200">
		You start with ten acres and a hundred carp. Feed them right, keep the water sweet, and the anglers who come
		will catch the fish that make your name — then take your own rods to any water in the game.
	</p>
	<form method="POST" action="?/signInWithGoogle">
		<button class="button-primary px-8 py-3 text-lg">Sign in with Google</button>
	</form>
	{#if hasSignInError}
		<p class="mt-4 text-danger-400">Sign-in didn't complete — try again.</p>
	{/if}
</section>
