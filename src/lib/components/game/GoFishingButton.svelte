<script lang="ts">
	interface Props {
		lakeId: string;
		words: string;
		buttonClass?: string;
	}

	let { lakeId, words, buttonClass = 'button-primary' }: Props = $props();
</script>

<a href="/fish/{lakeId}" class="{buttonClass} inline-block text-center">{words}</a>
