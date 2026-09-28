import { BufferAttribute, BufferGeometry } from 'three';
import type { WorldPoint } from '../lakeFrame';
import { CoverNoise } from '../grass/coverNoise';
import type { SurveyedBank } from '../grass/coverGround';
import { marginShareAt } from '../grass/coverDensity';
import { CoverSites } from '../grass/coverSite';
import { resampledLoop } from './edgeSamples';

export interface BandRow {
	inset: number;
	height: number;
	textureShift: number;
}

const Band = { StepMetres: 1.5, Sink: 0.1, TileMetres: 6, HeightSwing: 0.7, Wavelength: 7, Lean: 0.2, Presence: 2.2, Darkest: 0.58, ShadeRange: 0.22 } as const;
const Rows: BandRow[] = [
	{ inset: 0.2, height: 0.95, textureShift: 0 },
	{ inset: 0.9, height: 1.35, textureShift: 0.43 }
];
const Channels = { Position: 3, Colour: 4, Uv: 2 } as const;

interface RibbonParts {
	positions: number[];
	colours: number[];
	uvs: number[];
	indices: number[];
}

function addColumn(parts: RibbonParts, bank: SurveyedBank, sites: CoverSites, sample: { point: WorldPoint; along: number }, row: BandRow) {
	const { point, along } = sample;
	const inland = bank.shore.headingTowardTheWater(point) + Math.PI;
	const base = { x: point.x + Math.cos(inland) * row.inset, z: point.z + Math.sin(inland) * row.inset };
	const noise = sites.noiseAt(base, Band.Wavelength);
	const bottom = Math.max(bank.groundAt(base), 0) - Band.Sink;
	const tall = row.height * (1 - Band.HeightSwing / 2 + noise * Band.HeightSwing);
	const presence = Math.min(1, marginShareAt(sites.siteAt(base)) * Band.Presence);
	const shade = Band.Darkest + noise * Band.ShadeRange;
	parts.positions.push(base.x, bottom, base.z, base.x + Math.cos(inland) * Band.Lean, bottom + tall, base.z + Math.sin(inland) * Band.Lean);
	parts.colours.push(shade, shade, shade, presence, shade, shade, shade, presence);
	const across = along / Band.TileMetres + row.textureShift;
	parts.uvs.push(across, 0, across, 1);
}

function addRibbon(parts: RibbonParts, bank: SurveyedBank, sites: CoverSites, edge: WorldPoint[], row: BandRow) {
	const samples = resampledLoop(edge, Band.StepMetres);
	const first = parts.positions.length / Channels.Position;
	samples.forEach((sample) => addColumn(parts, bank, sites, sample, row));
	for (let index = 0; index < samples.length - 1; index++) {
		const corner = first + index * 2;
		parts.indices.push(corner, corner + 2, corner + 1, corner + 1, corner + 2, corner + 3);
	}
}

function upwardNormals(count: number) {
	const normals = new Float32Array(count * Channels.Position);
	for (let index = 0; index < count; index++) normals[index * Channels.Position + 1] = 1;
	return normals;
}

export function bandRibbons(bank: SurveyedBank) {
	const sites = new CoverSites(bank);
	const parts: RibbonParts = { positions: [], colours: [], uvs: [], indices: [] };
	bank.edges.forEach((edge) => Rows.forEach((row) => addRibbon(parts, bank, sites, edge, row)));
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(parts.positions), Channels.Position));
	geometry.setAttribute('color', new BufferAttribute(new Float32Array(parts.colours), Channels.Colour));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(parts.uvs), Channels.Uv));
	geometry.setAttribute('normal', new BufferAttribute(upwardNormals(parts.positions.length / Channels.Position), Channels.Position));
	geometry.setIndex(parts.indices);
	return geometry;
}
