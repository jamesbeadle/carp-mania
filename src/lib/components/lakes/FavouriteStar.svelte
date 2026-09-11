<script lang="ts">
	import { enhance } from '$app/forms';

	interface Props {
		lakeId: string;
		isFavourite: boolean;
		isLabelled?: boolean;
	}

	let { lakeId, isFavourite, isLabelled = false }: Props = $props();

	const FavouriteAction = '?/favourite';
	const UnfavouriteAction = '?/unfavourite';
	const FilledStar = '★';
	const HollowStar = '☆';

	const action = $derived(isFavourite ? UnfavouriteAction : FavouriteAction);
	const title = $derived(isFavourite ? 'Take this water off your favourites' : 'Keep this water in your favourites');
</script>

<form method="POST" {action} use:enhance class="contents">
	<input type="hidden" name="lakeId" value={lakeId} />
	<button class="button-secondary text-base" class:text-volt-300={isFavourite} class:border-volt-500={isFavourite} aria-pressed={isFavourite} {title}>
		{isFavourite ? FilledStar : HollowStar}{#if isLabelled}<span class="ml-1">Favourite</span>{/if}
	</button>
</form>
