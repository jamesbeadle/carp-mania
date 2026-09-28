import { CylinderGeometry, Quaternion, Vector3 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Canopy } from './canopies';

const TrunkSides = 8;
const LimbSides = 5;
const Limb = { LengthShare: 0.85, LeastTilt: 0.55, TiltRange: 0.45, TopShare: 0.72, TipShare: 0.3, RootShare: 0.55 } as const;
const TrunkIntoCrown = 0.3;
const TaperShare = 0.55;
const UpAxis = new Vector3(0, 1, 0);

function limb(canopy: Canopy, index: number, random: () => number) {
	const length = canopy.radius * Limb.LengthShare * (0.7 + random() * 0.5);
	const geometry = new CylinderGeometry(canopy.trunkRadius * Limb.TipShare, canopy.trunkRadius * Limb.RootShare, length, LimbSides).translate(0, length / 2, 0);
	const heading = (index / canopy.limbs) * Math.PI * 2 + random();
	const tilt = Limb.LeastTilt + random() * Limb.TiltRange;
	const direction = new Vector3(Math.sin(tilt) * Math.cos(heading), Math.cos(tilt), Math.sin(tilt) * Math.sin(heading));
	geometry.applyQuaternion(new Quaternion().setFromUnitVectors(UpAxis, direction));
	return geometry.translate(0, canopy.trunkHeight + (canopy.centre - canopy.trunkHeight) * Limb.TopShare * random(), 0);
}

export function trunkGeometry(canopy: Canopy, random: () => number) {
	const height = canopy.trunkHeight + canopy.centre * TrunkIntoCrown;
	const trunk = new CylinderGeometry(canopy.trunkRadius * TaperShare, canopy.trunkRadius, height, TrunkSides).translate(0, height / 2, 0);
	const limbs = Array.from({ length: canopy.limbs }, (_, index) => limb(canopy, index, random));
	return mergeGeometries([trunk, ...limbs]);
}
