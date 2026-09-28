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

const Band = { StepMetres: 1.5, Sink: 0.1, TileMetres: 6, HeightSwing: 0.7, Wavelength: 7, Lean: 0.2, Presence: 2.2, Darkest: 0.4, ShadeRange: 0.2, JitterWavelength: 1.1, Jitter: 1 } as const;
const Rows: BandRow[] = [
	{ inset: 0.2, height: 1.1, textureShift: 0 },
	{ inset: 0.9, height: 1.7, textureShift: 0.43 }
];
const Channels = { Position: 3, Colour: 4, Uv: 2, Rise: 1 } as const;

const Facing = { Outward: 0.75, Upward: 0.66 } as const;

interface RibbonParts {
	rises: number[];
	normals: number[];
	positions: number[];
	colours: number[];
	uvs: number[];
	indices: number[];
}

function vertexCount(parts: RibbonParts) {
	const { positions } = parts;
	return positions.length / Channels.Position;
}

function addColumn(parts: RibbonParts, bank: SurveyedBank, sites: CoverSites, sample: { point: WorldPoint; along: number }, row: BandRow) {
	const { point, along } = sample;
	const inland = bank.shore.headingTowardTheWater(point) + Math.PI;
	const base = { x: point.x + Math.cos(inland) * row.inset, z: point.z + Math.sin(inland) * row.inset };
	const noise = sites.noiseAt(base, Band.Wavelength);
	const bottom = Math.max(bank.groundAt(base), 0) - Band.Sink;
	const jitter = 1 + (sites.noiseAt(base, Band.JitterWavelength) - 1 / 2) * Band.Jitter;
	const tall = row.height * (1 - Band.HeightSwing / 2 + noise * Band.HeightSwing) * jitter;
	const presence = Math.min(1, marginShareAt(sites.siteAt(base)) * Band.Presence);
	const shade = Band.Darkest + noise * Band.ShadeRange;
	parts.positions.push(base.x, bottom, base.z, base.x + Math.cos(inland) * Band.Lean, bottom + tall, base.z + Math.sin(inland) * Band.Lean);
	parts.rises.push(0, tall);
	const outward = [-Math.cos(inland) * Facing.Outward, Facing.Upward, -Math.sin(inland) * Facing.Outward];
	parts.normals.push(...outward, ...outward);
	parts.colours.push(shade, shade, shade, presence, shade, shade, shade, presence);
	const across = along / Band.TileMetres + row.textureShift;
	parts.uvs.push(across, 0, across, 1);
}

function addRibbon(parts: RibbonParts, bank: SurveyedBank, sites: CoverSites, edge: WorldPoint[], row: BandRow) {
	const samples = resampledLoop(edge, Band.StepMetres);
	const first = vertexCount(parts);
	samples.forEach((sample) => addColumn(parts, bank, sites, sample, row));
	for (let index = 0; index < samples.length - 1; index++) {
		const corner = first + index * 2;
		parts.indices.push(corner, corner + 2, corner + 1, corner + 1, corner + 2, corner + 3);
	}
}

export function bandRibbons(bank: SurveyedBank) {
	const sites = new CoverSites(bank);
	const parts: RibbonParts = { rises: [], normals: [], positions: [], colours: [], uvs: [], indices: [] };
	bank.edges.forEach((edge) => Rows.forEach((row) => addRibbon(parts, bank, sites, edge, row)));
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(parts.positions), Channels.Position));
	geometry.setAttribute('color', new BufferAttribute(new Float32Array(parts.colours), Channels.Colour));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(parts.uvs), Channels.Uv));
	geometry.setAttribute('bandRise', new BufferAttribute(new Float32Array(parts.rises), Channels.Rise));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(parts.normals), Channels.Position));
	geometry.setIndex(parts.indices);
	return geometry;
}
