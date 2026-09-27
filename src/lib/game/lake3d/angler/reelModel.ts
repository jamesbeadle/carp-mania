import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial } from 'three';
import type { ReelItem } from '$lib/domain/tackle/tackleItem';
import { reelLookOf, ReelSpoolMetres } from './kitLooks';

const Stem = { Height: 0.07, Width: 0.012 } as const;
const Body = { Length: 0.075, Height: 0.06, Width: 0.045 } as const;
const Spool = { Length: 0.05, Sides: 20 } as const;
const Handle = { Arm: 0.06, Knob: 0.012 } as const;

export function createReel(reel: ReelItem) {
	const look = reelLookOf(reel.brand);
	const spoolRadius = ReelSpoolMetres[reel.reel];
	const bodyMaterial = new MeshStandardMaterial({ color: look.body, metalness: 0.5, roughness: 0.4 });
	const spoolMaterial = new MeshStandardMaterial({ color: look.spool, metalness: 0.7, roughness: 0.3 });
	const stem = new Mesh(new BoxGeometry(Stem.Width, Stem.Height, Stem.Width * 2), bodyMaterial);
	stem.position.setY(-Stem.Height / 2);
	const body = new Mesh(new BoxGeometry(Body.Width, Body.Height, Body.Length), bodyMaterial);
	body.position.set(0, -Stem.Height - Body.Height / 2, -Body.Length * 0.2);
	const spoolGeometry = new CylinderGeometry(spoolRadius, spoolRadius * 0.9, Spool.Length, Spool.Sides);
	spoolGeometry.rotateX(Math.PI / 2);
	const spool = new Mesh(spoolGeometry, spoolMaterial);
	spool.position.set(0, -Stem.Height - Body.Height / 2, Body.Length * 0.55);
	const handle = new Mesh(new BoxGeometry(Handle.Arm, Handle.Knob, Handle.Knob), bodyMaterial);
	handle.position.set(Body.Width / 2 + Handle.Arm / 2, -Stem.Height - Body.Height / 2, -Body.Length * 0.2);
	return new Group().add(stem, body, spool, handle);
}
