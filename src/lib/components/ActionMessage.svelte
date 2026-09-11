<script lang="ts">
	let { form }: { form: { message?: string } | null | undefined } = $props();
</script>

{#if form?.message}
	<p class="mb-4 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm text-gold-300">{form.message}</p>
{/if}
