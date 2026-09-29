import { PerspectiveCamera, Scene } from 'three';
import { createFacilities } from './bank/facilities3d';
import { plotFacilities } from './bank/facilityGrounds';
import { untilTheNextFrame } from './frameYield';
import { lakeFrameFor, plotReachOf, worldPointOf, type LakeFrame, type WorldPoint } from './lakeFrame';
import { LakeWater } from './lakeWater';
import { bedDepthFor } from './bedDepth';
import { LakeWorld, type LakeWorldPlan } from './lakeWorld';
import { NearDetailLayer } from './renderQuality';
import { SkyAndLight } from './skyAndLight';
import { fineWorldOutline } from './terrain/fineOutline';
import { createLakeLand } from './terrain/lakeLand';
import { plantTrees } from './trees/treePlanting';
import { buildVegetation } from './vegetationBuild';
import { smoothWorldOutline } from './worldShapes';

const Lens = { FieldOfViewDegrees: 50, Nearest: 0.1, Farthest: 12000 } as const;
const PegClearing = 10;
const ShadowShareOfPlot = 0.75;

interface Plot {
	frame: LakeFrame;
	plotReach: number;
	outline: WorldPoint[];
	islands: WorldPoint[][];
	shoreline: { outline: WorldPoint[]; islands: WorldPoint[][] };
	pegs: WorldPoint[];
	wholePlot: WorldPoint;
	plotEdge: WorldPoint | null;
}

function surveyThePlot(plan: LakeWorldPlan): Plot {
	const { layout } = plan;
	const frame = lakeFrameFor(plan.plotAcres);
	const outline = smoothWorldOutline(frame, layout.outline);
	const islands = layout.islands.map((island) => smoothWorldOutline(frame, island.points));
	const shoreline = { outline: fineWorldOutline(frame, layout.outline), islands: layout.islands.map((island) => fineWorldOutline(frame, island.points)) };
	const wholePlot = { x: frame.metresAcross / 2, z: frame.metresDown / 2 };
	const plotEdge = plan.isDiorama ? wholePlot : null;
	const pegs = plan.pegs.map((peg) => worldPointOf(frame, peg));
	return { frame, plotReach: plotReachOf(frame), outline, islands, shoreline, pegs, wholePlot, plotEdge };
}

export async function buildLakeWorld(plan: LakeWorldPlan, width: number, height: number, signal?: AbortSignal): Promise<LakeWorld> {
	const { layout, season } = plan;
	const plot = surveyThePlot(plan);
	const { frame, outline, islands, shoreline, pegs, plotEdge, plotReach } = plot;
	const scene = new Scene();
	const camera = new PerspectiveCamera(Lens.FieldOfViewDegrees, width / Math.max(1, height), Lens.Nearest, Lens.Farthest);
	const sky = new SkyAndLight(scene, plotReach * ShadowShareOfPlot, !plan.isDiorama);
	const water = new LakeWater(shoreline.outline, shoreline.islands, plan.transparencyPercent, width, height);
	water.keepOutOfTheReflection(camera, NearDetailLayer);
	await untilTheNextFrame(signal);
	const land = createLakeLand({ ...shoreline, swimWater: { outline, islands }, plotEdge, plotReach, season, bed: layout.baseBed, bedDepth: bedDepthFor(layout), pegs, clock: water.clock });
	const { groundAt } = land;
	water.useShoreMap(land.shoreMap);
	await untilTheNextFrame(signal);
	const plots = plotFacilities(layout, { outline, islands }, pegs, plot.wholePlot);
	const facilities = createFacilities(plots, groundAt);
	await untilTheNextFrame(signal);
	const keepClear = [...pegs.map((point) => ({ point, radius: PegClearing })), ...plots.map((one) => ({ point: one.point, radius: one.footprintMetres / 2 }))];
	const woodland = plantTrees({ outline: shoreline.outline, islands: shoreline.islands, keepClear, plotReach, plotEdge, seed: plan.seed });
	await untilTheNextFrame(signal);
	const vegetation = await buildVegetation({ woodland, layout, frame, outline: shoreline.outline, islands: shoreline.islands, pegs, keepClear, plotEdge, season, seed: plan.seed, groundAt }, signal);
	await untilTheNextFrame(signal);
	scene.add(sky.group, land.group, water.mesh, vegetation.group, facilities.group);
	return new LakeWorld({ scene, camera, frame, outline, islands, water, sky, facilityLabels: facilities.labels, groundAt, vegetation });
}
