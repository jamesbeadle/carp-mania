<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import BudgetBar from '$lib/components/setup/BudgetBar.svelte';
	import NameStep from '$lib/components/setup/NameStep.svelte';
	import OpenTheGatesStep from '$lib/components/setup/OpenTheGatesStep.svelte';
	import SiteStep from '$lib/components/setup/SiteStep.svelte';
	import StepRail from '$lib/components/setup/StepRail.svelte';
	import StockStep from '$lib/components/setup/StockStep.svelte';
	import SurveyStep from '$lib/components/setup/SurveyStep.svelte';
	import WhereStep from '$lib/components/setup/WhereStep.svelte';
	import { WizardStep } from '$lib/contracts/SetupProgress';

	let { data, form } = $props();

	const isBuyingAnother = $derived(data.progress.openWaters.length > 0);
</script>

<header class="mb-6 flex flex-wrap items-end gap-6">
	<div>
		<p class="stat-label">{isBuyingAnother ? 'Your estate' : 'Carp Mania'}</p>
		<h1 class="text-4xl text-volt-300">{isBuyingAnother ? 'Buy another water' : 'Find your water'}</h1>
		{#if isBuyingAnother}<a href="/lake" class="text-sm text-surge-400 hover:underline">← Back to {data.progress.openWaters.length === 1 ? data.progress.openWaters[0].name : 'my waters'}</a>{/if}
	</div>
	<div class="w-full sm:ml-auto sm:w-96"><BudgetBar moneyLeft={data.progress.moneyLeft} /></div>
</header>

<StepRail current={data.step} progress={data.progress} />
<ActionMessage {form} />

{#if data.step === WizardStep.ChoosePlot}
	<WhereStep profile={data.progress.profile} guide={data.guide} />
{:else if data.step === WizardStep.BuySite}
	<SiteStep guide={data.guide} moneyLeft={data.progress.moneyLeft} />
{:else if data.step === WizardStep.Name && data.progress.lake}
	<NameStep lake={data.progress.lake} />
{:else if data.step === WizardStep.Survey && data.fishery}
	<SurveyStep fishery={data.fishery} />
{:else if data.step === WizardStep.Stock && data.fishery}
	<StockStep fishery={data.fishery} farmStock={data.farmStock} />
{:else if data.step === WizardStep.OpenTheGates && data.progress.lake}
	<OpenTheGatesStep lake={data.progress.lake} />
{/if}
