import { ClampToEdgeWrapping, DataTexture, DataUtils, HalfFloatType, LinearFilter, RGBAFormat, Vector4 } from 'three';
import type { WorldPoint } from '../lakeFrame';
import type { SurveyedBank } from './coverGround';
import { CoverSites } from './coverSite';
import { swardDensity, swardDryness, swardGrowth } from './swardGrowth';

export interface SwardField {
	texture: DataTexture;
	area: Vector4;
}

const Channels = 4;
const Sampling = { filter: LinearFilter, wrap: ClampToEdgeWrapping } as const;

function texelValues(point: WorldPoint, bank: SurveyedBank, sites: CoverSites) {
	const facilities = sites.facilitiesNear(point, 0);
	const site = sites.siteAt(point);
	const density = swardDensity(site) * sites.clearanceFrom(point, facilities);
	return [bank.groundAt(point), density, swardGrowth(site), swardDryness(site)];
}

function packed(across: number, down: number, valuesAt: (column: number, row: number) => number[]) {
	const data = new Uint16Array(across * down * Channels);
	for (let row = 0; row < down; row++) {
		for (let column = 0; column < across; column++) {
			const halves = valuesAt(column, row).map((value) => DataUtils.toHalfFloat(value));
			data.set(halves, (row * across + column) * Channels);
		}
	}
	return data;
}

export function bakeSwardField(bank: SurveyedBank, texelMetres: number): SwardField {
	const { least, most } = bank.area;
	const across = Math.ceil((most.x - least.x) / texelMetres);
	const down = Math.ceil((most.z - least.z) / texelMetres);
	const sites = new CoverSites(bank);
	const pointAt = (column: number, row: number) => ({ x: least.x + (column + 1 / 2) * texelMetres, z: least.z + (row + 1 / 2) * texelMetres });
	const data = packed(across, down, (column, row) => texelValues(pointAt(column, row), bank, sites));
	const texture = new DataTexture(data, across, down, RGBAFormat, HalfFloatType);
	const { filter, wrap } = Sampling;
	Object.assign(texture, { minFilter: filter, magFilter: filter, wrapS: wrap, wrapT: wrap, needsUpdate: true });
	return { texture, area: new Vector4(least.x, least.z, 1 / (across * texelMetres), 1 / (down * texelMetres)) };
}
