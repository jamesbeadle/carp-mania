import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';
import { mergedBoxes, type BoxSpec } from '../bank/mergedBoxes';
import { landingNet } from './landingNet';

const Bucket = { Top: 0.16, Bottom: 0.13, Height: 0.3, Rim: 0.008, Handle: 0.15, At: [-1.25, -1.2] } as const;
const Chair = { Seat: 0.34, Width: 0.55, Depth: 0.5, Pad: 0.07, Back: 0.62, Recline: 0.3, Leg: 0.025, At: [1.45, -1.3], Turn: -0.35 } as const;
const NetPlacing = { At: [-1.15, 0.35], Turn: 0.12, HeadDip: 0.34, Sink: 0.07 } as const;
const KitLook = { Bucket: '#243224', Rim: '#141a14', Frame: '#2b2e2b', Pad: '#3d4a33' } as const;

function bucket() {
	const material = new MeshStandardMaterial({ color: KitLook.Bucket, roughness: 0.55 });
	const body = new Mesh(new CylinderGeometry(Bucket.Top, Bucket.Bottom, Bucket.Height, 20, 1, true).translate(0, Bucket.Height / 2, 0), material);
	const base = new Mesh(new CylinderGeometry(Bucket.Bottom, Bucket.Bottom, 0.01, 20).translate(0, 0.005, 0), material);
	const rim = new Mesh(new TorusGeometry(Bucket.Top, Bucket.Rim, 6, 24).rotateX(Math.PI / 2).translate(0, Bucket.Height, 0), new MeshStandardMaterial({ color: KitLook.Rim }));
	const handle = new Mesh(new TorusGeometry(Bucket.Handle, 0.004, 4, 16, Math.PI).translate(0, Bucket.Height, 0), new MeshStandardMaterial({ color: KitLook.Rim, metalness: 0.6 }));
	const group = new Group().add(body, base, rim, handle);
	group.position.set(Bucket.At[0], 0, Bucket.At[1]);
	return group;
}

function chair() {
	const legs = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([across, along]): BoxSpec => ({ size: [Chair.Leg, Chair.Seat, Chair.Leg], at: [(across * Chair.Width) / 2, Chair.Seat / 2, (along * Chair.Depth) / 2] }));
	const rails = [-1, 1].map((side): BoxSpec => ({ size: [Chair.Leg, Chair.Leg, Chair.Depth], at: [(side * Chair.Width) / 2, Chair.Seat, 0] }));
	const seat: BoxSpec = { size: [Chair.Width, Chair.Pad, Chair.Depth], at: [0, Chair.Seat + Chair.Pad / 2, 0] };
	const back: BoxSpec = { size: [Chair.Width, Chair.Back, Chair.Pad], at: [0, Chair.Seat + Chair.Back / 2, -Chair.Depth / 2 - 0.08], tilt: -Chair.Recline };
	const group = new Group().add(mergedBoxes([...legs, ...rails], new MeshStandardMaterial({ color: KitLook.Frame, metalness: 0.5, roughness: 0.4 })), mergedBoxes([seat, back], new MeshStandardMaterial({ color: KitLook.Pad, roughness: 0.9 })));
	group.position.set(Chair.At[0], 0, Chair.At[1]);
	group.rotateY(Chair.Turn);
	return group;
}

function netInTheMargin() {
	const net = landingNet(NetPlacing.HeadDip);
	net.rotateY(NetPlacing.Turn);
	net.position.set(NetPlacing.At[0], -NetPlacing.Sink, NetPlacing.At[1]);
	return net;
}

export function bankKit() {
	const kit = new Group().add(bucket(), chair(), netInTheMargin());
	kit.traverse((part) => (part.castShadow = true));
	return kit;
}
