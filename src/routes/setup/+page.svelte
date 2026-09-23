<script lang="ts">
	import ActionMessage from '$lib/components/ActionMessage.svelte';
	import PlaceBanner from '$lib/components/place/PlaceBanner.svelte';
	import BudgetBar from '$lib/components/setup/BudgetBar.svelte';
	import NameStep from '$lib/components/setup/NameStep.svelte';
	import OpenTheGatesStep from '$lib/components/setup/OpenTheGatesStep.svelte';
	import SiteStep from '$lib/components/setup/SiteStep.svelte';
	import StepRail from '$lib/components/setup/StepRail.svelte';
	import StockStep from '$lib/components/setup/StockStep.svelte';
	import SurveyStep from '$lib/components/setup/SurveyStep.svelte';
	import WhereStep from '$lib/components/setup/WhereStep.svelte';
	import { WizardStep } from '$lib/contracts/SetupProgress';
	import { fishInTheWater } from '$lib/domain/stock/stockedToOpen';
	import { AnotherWaterStory, SetupStory } from '$lib/game/setup/setupStory';

	let { data, form } = $props();

	const isBuyingAnother = $derived(data.progress.openWaters.length > 0);
	const chapter = $derived(isBuyingAnother && data.step === WizardStep.ChoosePlot ? AnotherWaterStory : SetupStory[data.step]);
	const backWords = $derived(data.progress.openWaters.length === 1 ? data.progress.openWaters[0].name : 'my waters');
	const fishCount = $derived(data.fishery ? fishInTheWater(data.fishery.carp, data.fishery.shoals) : 0);
</script>

<svelte:head><title>{isBuyingAnother ? 'Buy another water' : 'Find your water'} · Carp Mania</title></svelte:head>

<PlaceBanner kind="office" title={isBuyingAnother ? 'Buy another water' : 'Find your water'} blurb={chapter.line} words={chapter.sign} skyOver={data.progress.lake}>
	{#snippet aside()}<p class="stat-label text-mist-100/90">{chapter.heading}</p>{/snippet}
	{#snippet actions()}
		<div class="w-full sm:w-80"><BudgetBar moneyLeft={data.progress.moneyLeft} /></div>
		{#if isBuyingAnother}<a href="/lake" class="button-secondary text-base">← {backWords}</a>{/if}
	{/snippet}
</PlaceBanner>

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
	<StockStep fishery={data.fishery} />
{:else if data.step === WizardStep.OpenTheGates && data.progress.lake}
	<OpenTheGatesStep lake={data.progress.lake} {fishCount} />
{/if}
