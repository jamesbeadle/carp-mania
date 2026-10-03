<script lang="ts">
	import { enhance } from '$app/forms';
	import { LicenceField } from '$lib/contracts/AnglerLicence';
	import { lookCode, type PortraitLook } from '$lib/domain/portrait/portraitLook';
	import { formatMoney } from '$lib/format/money';
	import { sound } from '$lib/game/sound/soundEngine.svelte';
	import LicenceSeal from './LicenceSeal.svelte';
	import PortraitFrame from './PortraitFrame.svelte';

	let { name, look, purse, onback }: { name: string; look: PortraitLook; purse: number; onback: () => void } = $props();

	let isStamped = $state(false);

	function stampTheLicence() {
		isStamped = true;
		sound.play('chime');
		return async ({ update }: { update: () => Promise<void> }) => {
			isStamped = false;
			await update();
		};
	}
</script>

<section class="mx-auto flex w-full max-w-md flex-col items-center gap-5">
	<p class="stat-label text-center">Step three · sign it, then go find your water</p>
	<article class="licence relative w-full overflow-hidden rounded-2xl border-2 border-volt-500/70 p-5 shadow-volt">
		<header class="mb-4 flex items-center justify-between">
			<p class="font-display text-sm font-bold tracking-[0.25em] text-volt-300 uppercase">Angler's licence</p>
			<p class="font-display text-sm text-mist-400 uppercase">Season one</p>
		</header>
		<div class="flex items-center gap-4">
			<PortraitFrame {look} size="h-28 w-28" />
			<div class="min-w-0">
				<p class="stat-label">Fishes as</p>
				<p class="truncate font-display text-3xl font-extrabold text-mist-100 uppercase italic">{name}</p>
				<p class="text-sm text-mist-400">First generation · fresh to the bank</p>
			</div>
		</div>
		<dl class="mt-4 grid grid-cols-2 gap-2 text-sm">
			<div class="rounded-lg bg-carbon-950/60 p-2"><dt class="stat-label">Purse</dt><dd class="font-display text-xl text-volt-400">{formatMoney(purse)}</dd></div>
			<div class="rounded-lg bg-carbon-950/60 p-2"><dt class="stat-label">Waters</dt><dd class="font-display text-xl text-mist-100">None yet</dd></div>
		</dl>
		{#if isStamped}<LicenceSeal />{/if}
	</article>
	<form method="POST" action="?/sign" class="flex w-full items-center gap-3" use:enhance={stampTheLicence}>
		<input type="hidden" name={LicenceField.Name} value={name} />
		<input type="hidden" name={LicenceField.Look} value={lookCode(look)} />
		<button type="button" class="text-sm whitespace-nowrap text-mist-400 hover:text-mist-100" onclick={onback}>← Back</button>
		<button class="button-primary ml-auto px-6 py-3 text-xl" disabled={isStamped}>Sign it →</button>
	</form>
</section>

<style>
	.licence {
		background:
			repeating-linear-gradient(135deg, rgba(62, 232, 58, 0.04) 0 12px, transparent 12px 24px),
			linear-gradient(160deg, var(--color-carbon-700), var(--color-carbon-900));
		animation: deal 700ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	@keyframes deal {
		from {
			opacity: 0;
			transform: perspective(800px) rotateY(-70deg) translateY(20px);
		}
	}
</style>
