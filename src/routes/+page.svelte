<script lang="ts">
	import LandingHero from '$lib/components/LandingHero.svelte';

	let { data } = $props();
</script>

<LandingHero hasSignInError={data.hasSignInError} />
