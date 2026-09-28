import { CylinderGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, SphereGeometry, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ReelItem } from '$lib/domain/tackle/tackleItem';
import { reelLookOf, ReelSpoolMetres } from './kitLooks';

const Stem = { Height: 0.07, Width: 0.012, Depth: 0.024 } as const;
const Body = { Length: 0.07, Height: 0.058, Width: 0.042, Rounding: 0.014 } as const;
const Spool = { Length: 0.05, Sides: 28, LineShare: 0.86, Lip: 1.08 } as const;
const Rotor = { Length: 0.03, Share: 0.95 } as const;
const Handle = { Arm: 0.065, Thickness: 0.008, Knob: 0.011, KnobLength: 0.028 } as const;
const LineColour = '#dfe6e9';

function spoolProfile(radius: number) {
	const lineRadius = radius * Spool.LineShare;
	return [new Vector2(0.002, 0), new Vector2(radius * Spool.Lip, 0), new Vector2(radius * Spool.Lip, 0.004), new Vector2(lineRadius, 0.007), new Vector2(lineRadius, Spool.Length - 0.004), new Vector2(radius, Spool.Length), new Vector2(0.002, Spool.Length)];
}

function spoolOf(radius: number, metal: MeshStandardMaterial) {
	const lip = new Mesh(new LatheGeometry(spoolProfile(radius), Spool.Sides).rotateX(-Math.PI / 2), metal);
	const line = new Mesh(new CylinderGeometry(radius * Spool.LineShare * 0.99, radius * Spool.LineShare * 0.99, Spool.Length * 0.8, Spool.Sides).rotateX(Math.PI / 2), new MeshStandardMaterial({ color: LineColour, roughness: 0.5 }));
	line.position.setZ(-Spool.Length / 2);
	return new Group().add(lip, line);
}

function handleOf(metal: MeshStandardMaterial, knob: MeshStandardMaterial) {
	const arm = new Mesh(new RoundedBoxGeometry(Handle.Arm, Handle.Thickness, Handle.Thickness, 2, Handle.Thickness / 3), metal);
	arm.position.setX(Handle.Arm / 2);
	const grip = new Mesh(new CylinderGeometry(Handle.Knob, Handle.Knob, Handle.KnobLength, 16).rotateZ(Math.PI / 2), knob);
	grip.position.set(Handle.Arm, 0, 0);
	grip.rotation.set(0, Math.PI / 2, 0);
	return new Group().add(arm, grip, new Mesh(new SphereGeometry(Handle.Thickness, 10, 8), metal));
}

export function createReel(reel: ReelItem) {
	const look = reelLookOf(reel.brand);
	const spoolRadius = ReelSpoolMetres[reel.reel];
	const body = new MeshStandardMaterial({ color: look.body, metalness: 0.6, roughness: 0.35 });
	const metal = new MeshStandardMaterial({ color: look.spool, metalness: 0.85, roughness: 0.25 });
	const stem = new Mesh(new RoundedBoxGeometry(Stem.Width, Stem.Height, Stem.Depth, 2, Stem.Width / 3), body);
	stem.position.setY(-Stem.Height / 2);
	const centre = -Stem.Height - Body.Height / 2;
	const housing = new Mesh(new RoundedBoxGeometry(Body.Width, Body.Height, Body.Length, 3, Body.Rounding), body);
	housing.position.set(0, centre, -Body.Length * 0.2);
	const rotor = new Mesh(new CylinderGeometry(spoolRadius * Rotor.Share, spoolRadius * 0.7, Rotor.Length, Spool.Sides).rotateX(Math.PI / 2), body);
	rotor.position.set(0, centre, Body.Length * 0.25);
	const spool = spoolOf(spoolRadius, metal);
	spool.position.set(0, centre, Body.Length * 0.35 + Spool.Length);
	const handle = handleOf(metal, new MeshStandardMaterial({ color: look.body, roughness: 0.6 }));
	handle.position.set(Body.Width / 2, centre, -Body.Length * 0.2);
	return new Group().add(stem, housing, rotor, spool, handle);
}
