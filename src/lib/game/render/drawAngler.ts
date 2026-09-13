import type { Point } from '../scene/lakeShape';
import { AnglerPalette } from '../scene/palette';

const Body = { Length: 11, Width: 8, HeadRadius: 5, HeadForward: 2, HatRadius: 6 } as const;
const Chair = { Back: -8, Width: 4, Length: 18, Corner: 2 } as const;
const Shadow = { Drop: 3, Length: 14, Width: 10 } as const;
const Bivvy = { Back: -20, Side: -30, Length: 18, Width: 13, DoorLength: 5, DoorWidth: 8, LightOffset: -5 } as const;

export function drawAngler(context: CanvasRenderingContext2D, position: Point, facing: number) {
	context.save();
	context.translate(position.x, position.y);
	context.rotate(facing);
	drawBivvy(context);
	drawShadow(context);
	drawChair(context);
	drawBody(context);
	context.restore();
}

function drawShadow(context: CanvasRenderingContext2D) {
	context.fillStyle = AnglerPalette.Shadow;
	context.beginPath();
	context.ellipse(-Shadow.Drop, Shadow.Drop, Shadow.Length, Shadow.Width, 0, 0, Math.PI * 2);
	context.fill();
}

function drawChair(context: CanvasRenderingContext2D) {
	context.fillStyle = AnglerPalette.Chair;
	context.beginPath();
	context.roundRect(Chair.Back - Chair.Width, -Chair.Length / 2, Chair.Width, Chair.Length, Chair.Corner);
	context.fill();
}

function drawBody(context: CanvasRenderingContext2D) {
	context.fillStyle = AnglerPalette.Jacket;
	context.beginPath();
	context.ellipse(0, 0, Body.Length, Body.Width, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.Skin;
	context.beginPath();
	context.arc(Body.HeadForward, 0, Body.HeadRadius, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.Hat;
	context.beginPath();
	context.arc(Body.HeadForward, 0, Body.HatRadius, Math.PI * 0.5, Math.PI * 1.5);
	context.fill();
}

function drawBivvy(context: CanvasRenderingContext2D) {
	context.save();
	context.translate(Bivvy.Back, Bivvy.Side);
	context.fillStyle = AnglerPalette.Shadow;
	context.beginPath();
	context.ellipse(-Shadow.Drop, Shadow.Drop, Bivvy.Length + 1, Bivvy.Width, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.Bivvy;
	context.beginPath();
	context.ellipse(0, 0, Bivvy.Length, Bivvy.Width, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.BivvyLight;
	context.beginPath();
	context.ellipse(Bivvy.LightOffset, Bivvy.LightOffset, Bivvy.Length * 0.45, Bivvy.Width * 0.4, 0, 0, Math.PI * 2);
	context.fill();
	context.fillStyle = AnglerPalette.BivvyDoor;
	context.beginPath();
	context.ellipse(Bivvy.Length - Bivvy.DoorLength, 0, Bivvy.DoorLength, Bivvy.DoorWidth / 2, 0, -Math.PI / 2, Math.PI / 2);
	context.fill();
	context.restore();
}
