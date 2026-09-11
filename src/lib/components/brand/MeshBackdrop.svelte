<script lang="ts">
	let { opacity = 0.35, rows = 9, columns = 28 }: { opacity?: number; rows?: number; columns?: number } = $props();

	const width = 1200;
	const height = 320;
	const amplitude = 26;

	const surfaceY = (column: number, row: number) => {
		const x = column / columns;
		const depth = row / rows;
		const wave = Math.sin(x * Math.PI * 3.2 + depth * 2.4) * amplitude * (1 - depth * 0.5) + Math.sin(x * Math.PI * 7 + depth) * amplitude * 0.3;
		return 40 + depth * (height - 80) + wave;
	};

	const horizontalLines = Array.from({ length: rows + 1 }, (_, row) =>
		Array.from({ length: columns + 1 }, (_, column) => `${(column / columns) * width},${surfaceY(column, row)}`).join(' ')
	);
	const verticalLines = Array.from({ length: columns + 1 }, (_, column) =>
		Array.from({ length: rows + 1 }, (_, row) => `${(column / columns) * width},${surfaceY(column, row)}`).join(' ')
	);
</script>

<svg viewBox="0 0 {width} {height}" preserveAspectRatio="none" class="pointer-events-none absolute inset-0 h-full w-full" style="opacity: {opacity}" aria-hidden="true">
	<defs>
		<linearGradient id="mesh-stroke" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="var(--color-volt-500)" />
			<stop offset="0.6" stop-color="var(--color-volt-400)" />
			<stop offset="1" stop-color="var(--color-surge-500)" />
		</linearGradient>
		<linearGradient id="mesh-fade" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="white" stop-opacity="0.15" />
			<stop offset="0.55" stop-color="white" stop-opacity="1" />
			<stop offset="1" stop-color="white" stop-opacity="0.1" />
		</linearGradient>
		<mask id="mesh-mask"><rect width={width} height={height} fill="url(#mesh-fade)" /></mask>
	</defs>
	<g stroke="url(#mesh-stroke)" stroke-width="1.2" fill="none" mask="url(#mesh-mask)">
		{#each horizontalLines as points, index (index)}<polyline {points} />{/each}
		{#each verticalLines as points, index (index)}<polyline {points} stroke-opacity="0.6" />{/each}
	</g>
</svg>
