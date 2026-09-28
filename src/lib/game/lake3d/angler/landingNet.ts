import { CanvasTexture, CylinderGeometry, DoubleSide, Group, Mesh, MeshStandardMaterial, RepeatWrapping, Shape, ShapeGeometry, SRGBColorSpace, Vector2, Vector3, type Material } from 'three';

const Net = { Handle: 1.9, Arm: 1.05, Spread: 0.5, Rod: 0.014, ArmRod: 0.009, Cord: 0.004 } as const;
const Mesh3D = { Pixels: 64, Holes: 6, CutOff: 0.4, Repeat: 9 } as const;
const NetLook = { Pole: '#1c1f1c', Mesh: '#2e3a2c', Cord: '#c8c8c0' } as const;
const UpAxis = new Vector3(0, 1, 0);

function meshTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Mesh3D.Pixels;
	canvas.height = Mesh3D.Pixels;
	const context = canvas.getContext('2d');
	const step = Mesh3D.Pixels / Mesh3D.Holes;
	for (let line = 0; context && line <= Mesh3D.Holes; line++) {
		context.fillStyle = NetLook.Mesh;
		context.fillRect(line * step - 1, 0, 2, Mesh3D.Pixels);
		context.fillRect(0, line * step - 1, Mesh3D.Pixels, 2);
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	texture.repeat.set(Mesh3D.Repeat, Mesh3D.Repeat);
	return texture;
}

function rodBetween(from: Vector3, to: Vector3, radius: number, material: Material) {
	const length = from.distanceTo(to);
	const rod = new Mesh(new CylinderGeometry(radius, radius, length, 8), material);
	rod.position.lerpVectors(from, to, 0.5);
	rod.quaternion.setFromUnitVectors(UpAxis, to.clone().sub(from).normalize());
	return rod;
}

export function landingNet(headDip: number) {
	const pole = new MeshStandardMaterial({ color: NetLook.Pole, roughness: 0.5, metalness: 0.3 });
	const spreader = new Vector3(0, 0, 0);
	const corners = [-1, 1].map((side) => new Vector3(side * Net.Spread, 0, Net.Arm));
	const handle = rodBetween(new Vector3(0, 0, -Net.Handle), spreader, Net.Rod, pole);
	const arms = corners.map((corner) => rodBetween(spreader, corner, Net.ArmRod, pole));
	const cord = rodBetween(corners[0], corners[1], Net.Cord, new MeshStandardMaterial({ color: NetLook.Cord }));
	const outline = new Shape([new Vector2(0, 0), new Vector2(-Net.Spread, Net.Arm), new Vector2(Net.Spread, Net.Arm)]);
	const netting = new Mesh(new ShapeGeometry(outline).rotateX(Math.PI / 2), new MeshStandardMaterial({ map: meshTexture(), alphaTest: Mesh3D.CutOff, side: DoubleSide, roughness: 0.9 }));
	const head = new Group().add(...arms, cord, netting);
	head.rotateX(headDip);
	return new Group().add(handle, head);
}
