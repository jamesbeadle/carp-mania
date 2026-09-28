import { CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, TorusGeometry } from 'three';

const Eye = { Radius: 0.019, Along: 0.4, Up: 0.035, Out: 0.05, Pupil: 0.62, PupilOut: 0.011 } as const;
const Mouth = { Radius: 0.017, Lip: 0.0065, Along: 0.494, Down: -0.012 } as const;
const Barbel = { Length: 0.036, Root: 0.0032, Tip: 0.0012, Spread: 0.016, Down: -0.02, Along: 0.485, Hang: 0.5, Splay: 0.45 } as const;
const HeadLook = { Iris: '#c9a24a', Pupil: '#0c0c0c', Lip: '#b58a68', Barbel: '#a07a58' } as const;

function eyes() {
	const iris = new MeshStandardMaterial({ color: HeadLook.Iris, roughness: 0.25, metalness: 0.3 });
	const pupil = new MeshStandardMaterial({ color: HeadLook.Pupil, roughness: 0.1 });
	return [-1, 1].map((side) => {
		const ball = new Mesh(new SphereGeometry(Eye.Radius, 14, 10), iris);
		const centre = new Mesh(new SphereGeometry(Eye.Radius * Eye.Pupil, 12, 8), pupil);
		centre.position.setX(side * Eye.PupilOut);
		const eye = new Group().add(ball, centre);
		eye.position.set(side * Eye.Out, Eye.Up, Eye.Along);
		return eye;
	});
}

function mouth() {
	const lips = new Mesh(new TorusGeometry(Mouth.Radius, Mouth.Lip, 8, 18), new MeshStandardMaterial({ color: HeadLook.Lip, roughness: 0.6 }));
	lips.position.set(0, Mouth.Down, Mouth.Along);
	return lips;
}

function barbels() {
	const material = new MeshStandardMaterial({ color: HeadLook.Barbel, roughness: 0.7 });
	return [-1, 1].flatMap((side) => [0, 1].map((pair) => {
		const barbel = new Mesh(new CylinderGeometry(Barbel.Tip, Barbel.Root, Barbel.Length, 5).translate(0, -Barbel.Length / 2, 0), material);
		barbel.position.set(side * Barbel.Spread, Barbel.Down, Barbel.Along - pair * Barbel.Spread);
		barbel.rotation.set(-Barbel.Hang - pair * 0.3, 0, side * Barbel.Splay);
		return barbel;
	}));
}

export function carpHead() {
	return new Group().add(...eyes(), mouth(), ...barbels());
}
