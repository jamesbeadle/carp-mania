<script lang="ts">
	let { form }: { form: { message?: string } | null | undefined } = $props();
</script>

{#if form?.message}
	<p class="mb-4 rounded-xl border border-volt-500/40 bg-volt-500/10 px-4 py-2 text-sm text-volt-300">{form.message}</p>
{/if}
