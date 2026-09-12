import type { CatchReport, SkillGains } from '$lib/contracts/CatchReport';
import { FishingDay } from '$lib/domain/fishing/sessionClock';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import { MaximumRods } from '$lib/domain/tackle/rodSetup';
import { readRodSetups } from './readRodSetups';

const SkillGainNames: (keyof SkillGains)[] = ['line', 'rig', 'bait', 'watercraft'];

export function readCatchReport(candidate: unknown): CatchReport | null {
	const report = candidate as Partial<CatchReport> | null;
	if (!report || !isId(report.visitId) || !isId(report.carpId) || typeof report.swimName !== 'string') return null;
	if (!isRodIndex(report.rodIndex) || !isFishingHour(report.hour) || !isLayoutPoint(report.castPoint)) return null;
	const { setups } = readRodSetups([report.setup]);
	if (!setups || !isSkillGains(report.skillGains)) return null;
	return {
		visitId: report.visitId,
		carpId: report.carpId,
		rodIndex: report.rodIndex,
		hour: report.hour,
		castPoint: { x: report.castPoint.x, y: report.castPoint.y },
		setup: setups[0],
		swimName: report.swimName,
		skillGains: report.skillGains
	};
}

function isId(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}

function isRodIndex(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= 0 && (value as number) < MaximumRods;
}

function isFishingHour(value: unknown): value is number {
	return Number.isInteger(value) && (value as number) >= FishingDay.StartHour && (value as number) < FishingDay.EndHour;
}

function isLayoutPoint(value: unknown): value is LayoutPoint {
	const point = value as LayoutPoint | null;
	return isFraction(point?.x) && isFraction(point?.y);
}

function isFraction(value: unknown) {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

function isSkillGains(value: unknown): value is SkillGains {
	const gains = value as Record<string, unknown> | null;
	return gains !== null && typeof gains === 'object' && SkillGainNames.every((name) => typeof gains[name] === 'number' && Number.isFinite(gains[name]));
}
