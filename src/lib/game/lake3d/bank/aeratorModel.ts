import { CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, RingGeometry, SphereGeometry, TorusGeometry } from 'three';

const Float = { Radius: 0.55, Tube: 0.14, Lift: 0.04 } as const;
const Motor = { Radius: 0.3 } as const;
const Plume = { Top: 0.95, Bottom: 0.08, Height: 1.3, Lift: 0.7 } as const;
const Jet = { Top: 0.1, Bottom: 0.05, Height: 1.6, Lift: 0.8 } as const;
const Foam = { Inner: 0.6, Outer: 1.9, Lift: 0.02 } as const;
const AeratorLook = { Float: '#e8d44a', Motor: '#30353a', Spray: '#f4faff' } as const;
const Opacity = { Plume: 0.38, Jet: 0.7, Foam: 0.4 } as const;

function spray(opacity: number) {
	return new MeshStandardMaterial({ color: AeratorLook.Spray, transparent: true, opacity, depthWrite: false, side: DoubleSide, roughness: 0.3, emissive: AeratorLook.Spray, emissiveIntensity: 0.15 });
}

export function aerator() {
	const float = new Mesh(new TorusGeometry(Float.Radius, Float.Tube, 10, 28).rotateX(Math.PI / 2), new MeshStandardMaterial({ color: AeratorLook.Float, roughness: 0.4 }));
	float.position.setY(Float.Lift);
	const motor = new Mesh(new SphereGeometry(Motor.Radius, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), new MeshStandardMaterial({ color: AeratorLook.Motor, roughness: 0.5, metalness: 0.4 }));
	const plume = new Mesh(new CylinderGeometry(Plume.Top, Plume.Bottom, Plume.Height, 24, 1, true), spray(Opacity.Plume));
	plume.position.setY(Plume.Lift);
	const jet = new Mesh(new CylinderGeometry(Jet.Top, Jet.Bottom, Jet.Height, 12), spray(Opacity.Jet));
	jet.position.setY(Jet.Lift);
	const foam = new Mesh(new RingGeometry(Foam.Inner, Foam.Outer, 36).rotateX(-Math.PI / 2), spray(Opacity.Foam));
	foam.position.setY(Foam.Lift);
	return new Group().add(float, motor, plume, jet, foam);
}
