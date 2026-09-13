<script lang="ts">
	interface Props {
		lakeId: string;
		words: string;
		buttonClass?: string;
	}

	let { lakeId, words, buttonClass = 'button-primary' }: Props = $props();
</script>

<form method="POST" action="/fish/{lakeId}?/buyTicket">
	<button class={buttonClass}>{words}</button>
</form>
