<script lang="ts">
	import type { LakePostcard } from '$lib/contracts/LakePostcard';
	import { RegionCatalogue } from '$lib/domain/world/regions';
	import { formatMoney } from '$lib/format/money';
	import GoFishingButton from '../game/GoFishingButton.svelte';
	import LakeCanvas from '../LakeCanvas.svelte';
	import FavouriteStar from '../lakes/FavouriteStar.svelte';
	import PostcardNumbers from './PostcardNumbers.svelte';

	interface Props {
		lakeId: string | null;
		isFavourite: boolean;
		onClose: () => void;
	}

	let { lakeId, isFavourite, onClose }: Props = $props();

	const PostcardPath = '/world/postcard';
	const NotOnTheMap = 'That water is not on the map any more.';

	let postcard = $state<LakePostcard | null>(null);
	let failure = $state<string | null>(null);

	$effect(() => {
		if (!lakeId) return clearPostcard();
		loadPostcard(lakeId);
	});

	function clearPostcard() {
		postcard = null;
		failure = null;
	}

	async function loadPostcard(wantedLakeId: string) {
		failure = null;
		const response = await fetch(`${PostcardPath}/${wantedLakeId}`);
		const isStillWanted = wantedLakeId === lakeId;
		if (!isStillWanted) return;
		if (!response.ok) return showFailure();
		postcard = (await response.json()) as LakePostcard;
	}

	function showFailure() {
		postcard = null;
		failure = NotOnTheMap;
	}
</script>

<aside class="panel flex flex-col gap-3">
	{#if !lakeId}
		<p class="stat-label">Postcard</p>
		<p class="text-sm text-mist-400">Click a pin for a postcard: a live look at the water, its numbers, and the buttons to fish it.</p>
	{:else if failure}
		<p class="stat-label">Postcard</p>
		<p class="text-sm text-danger-400">{failure}</p>
		<button class="button-secondary self-start text-base" onclick={onClose}>Close</button>
	{:else if !postcard}
		<p class="stat-label">Postcard</p>
		<p class="text-sm text-mist-400">Writing the postcard…</p>
	{:else}
		<div class="flex items-start gap-2">
			<div class="min-w-0">
				<p class="stat-label">{postcard.numbers.ownerName}'s water · {RegionCatalogue[postcard.numbers.region].label}</p>
				<h2 class="text-2xl text-volt-300">{postcard.lake.name}</h2>
			</div>
			<button class="ml-auto text-xl text-mist-400 hover:text-mist-100" onclick={onClose} aria-label="Close the postcard">×</button>
		</div>
		<LakeCanvas lake={postcard.lake} swims={postcard.swims} carp={postcard.carp} />
		<PostcardNumbers numbers={postcard.numbers} />
		<div class="grid grid-cols-2 gap-2">
			<a href="/lakes/{lakeId}" class="button-secondary text-center text-base">Look around</a>
			<GoFishingButton {lakeId} words="Fish for {formatMoney(postcard.numbers.dayTicketFee)}" buttonClass="button-primary block w-full text-center text-base" />
			<FavouriteStar {lakeId} {isFavourite} isLabelled />
			<a href="/lakes/{lakeId}/shop" class="button-secondary text-center text-base">The shop</a>
		</div>
	{/if}
</aside>
