<script lang="ts">
	import Wordmark from '../brand/Wordmark.svelte';

	let { onbegin }: { onbegin: () => void } = $props();
</script>

<section class="mx-auto flex max-w-2xl flex-col items-center gap-6 py-10 text-center">
	<p class="stat-label rise">A new season starts now</p>
	<h1 class="rise beat-1 text-6xl leading-none sm:text-8xl"><Wordmark size="text-6xl sm:text-8xl" /></h1>
	<p class="rise beat-2 max-w-lg text-lg text-mist-200">
		The swims are empty. The fish have never seen a hook. Somewhere out there is a water with your name on the gate — but first, the bailiff wants to see your licence.
	</p>
	<button type="button" class="rise beat-3 button-primary px-10 py-3 text-2xl" onclick={onbegin}>Make my angler →</button>
	<form method="POST" action="/auth/signout" class="rise beat-4">
		<button class="text-xs text-mist-400 hover:text-mist-100">Not you? Sign out</button>
	</form>
</section>

<style>
	.rise {
		animation: rise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	.beat-1 {
		animation-delay: 120ms;
	}
	.beat-2 {
		animation-delay: 260ms;
	}
	.beat-3 {
		animation-delay: 420ms;
	}
	.beat-4 {
		animation-delay: 560ms;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
	}
</style>
