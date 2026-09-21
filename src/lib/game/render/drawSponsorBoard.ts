import { sponsorOnTheBoards } from '$lib/domain/sponsorship/lakeSponsorship';
import { BrandCatalogue } from '$lib/domain/tackle/brands';
import type { Lake } from '$lib/domain/types';
import { sponsorBoardSpotOf } from '../scene/sponsorBoardSpot';
import { BankPalette } from '../scene/palette';

const Board = { Width: 92, Height: 26, Radius: 3, LegHeight: 10, LegWidth: 3, Font: '700 11px Inter, system-ui, sans-serif', LineWidth: 1.5, TextMargin: 8 } as const;

export function drawSponsorBoard(context: CanvasRenderingContext2D, lake: Pick<Lake, 'layout' | 'sponsor_brand' | 'sponsored_until'>, now: Date) {
	const sponsor = sponsorOnTheBoards(lake, now);
	if (!sponsor) return;
	const { x, y } = sponsorBoardSpotOf(lake.layout);
	const { Width, Height, LegHeight, LegWidth, Radius } = Board;
	const left = x - Width / 2;
	const top = y - Height - LegHeight;
	context.save();
	context.fillStyle = BankPalette.BoardLeg;
	context.fillRect(x - Width / 3, y - LegHeight, LegWidth, LegHeight);
	context.fillRect(x + Width / 3 - LegWidth, y - LegHeight, LegWidth, LegHeight);
	context.fillStyle = BankPalette.BoardFace;
	context.strokeStyle = BankPalette.BoardEdge;
	context.lineWidth = Board.LineWidth;
	context.beginPath();
	context.roundRect(left, top, Width, Height, Radius);
	context.fill();
	context.stroke();
	context.fillStyle = BankPalette.BoardInk;
	context.font = Board.Font;
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	const words = BrandCatalogue[sponsor].label.toUpperCase();
	context.fillText(words, x, top + Height / 2, Width - Board.TextMargin);
	context.restore();
}
