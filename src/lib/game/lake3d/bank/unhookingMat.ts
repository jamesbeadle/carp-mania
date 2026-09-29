import { CanvasTexture, CapsuleGeometry, Group, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace, type Object3D } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { CarpStrain } from '$lib/domain/types';
import { createCarp } from '../fish/carpModel';
import { carpLengthMetres } from '../fish/carpSize';
import { swimBeat } from '../fish/swimmingMaterial';

const Mat = { Pixels: 256, Quilts: 7, Thickness: 0.07, Rounding: 0.03, Margin: 0.5, WidthShare: 0.62, FishLift: 0.08 } as const;
const Bolster = { Radius: 0.075, Inset: 0.02 } as const;
const MatLook = { Cloth: '#33603a', Stitch: 'rgba(190, 225, 175, 0.4)', Bolster: '#243f2a' } as const;
const Breathing = { Beat: 1.6, Sweep: 0.012 } as const;
const QuiltRelief = 2;

function quiltTexture() {
	const canvas = document.createElement('canvas');
	canvas.width = Mat.Pixels;
	canvas.height = Mat.Pixels;
	const context = canvas.getContext('2d');
	if (context) {
		context.fillStyle = MatLook.Cloth;
		context.fillRect(0, 0, Mat.Pixels, Mat.Pixels);
		context.strokeStyle = MatLook.Stitch;
		context.lineWidth = 2;
		const step = Mat.Pixels / Mat.Quilts;
		for (let offset = -Mat.Pixels; offset < Mat.Pixels * 2; offset += step) {
			context.beginPath();
			context.moveTo(offset, 0);
			context.lineTo(offset + Mat.Pixels, Mat.Pixels);
			context.moveTo(offset, Mat.Pixels);
			context.lineTo(offset + Mat.Pixels, 0);
			context.stroke();
		}
	}
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	texture.wrapS = RepeatWrapping;
	texture.wrapT = RepeatWrapping;
	return texture;
}

function bolsters(length: number, width: number) {
	const material = new MeshStandardMaterial({ color: MatLook.Bolster, roughness: 0.85 });
	const sides = [-1, 1].map((side) => {
		const bolster = new Mesh(new CapsuleGeometry(Bolster.Radius, length - Bolster.Radius * 2, 4, 12).rotateZ(Math.PI / 2), material);
		bolster.position.set(0, Mat.Thickness + Bolster.Radius * 0.6, side * (width / 2 - Bolster.Radius - Bolster.Inset));
		return bolster;
	});
	const ends = [-1, 1].map((end) => {
		const bolster = new Mesh(new CapsuleGeometry(Bolster.Radius * 0.8, width - Bolster.Radius * 4, 4, 12).rotateX(Math.PI / 2), material);
		bolster.position.set(end * (length / 2 - Bolster.Radius - Bolster.Inset), Mat.Thickness + Bolster.Radius * 0.5, 0);
		return bolster;
	});
	return [...sides, ...ends];
}

export function createMatWithFish(strain: CarpStrain, weightLb: number): Object3D {
	const fishLength = carpLengthMetres(weightLb);
	const length = fishLength + Mat.Margin;
	const width = Math.max(0.65, length * Mat.WidthShare);
	const quilt = quiltTexture();
	const pad = new Mesh(new RoundedBoxGeometry(length, Mat.Thickness, width, 3, Mat.Rounding), new MeshStandardMaterial({ map: quilt, bumpMap: quilt, bumpScale: QuiltRelief, roughness: 0.95 }));
	pad.position.setY(Mat.Thickness / 2);
	pad.receiveShadow = true;
	const fish = createCarp(strain, swimBeat(Breathing.Beat, Breathing.Sweep));
	fish.scale.setScalar(fishLength);
	fish.rotation.set(0, Math.PI / 2, Math.PI / 2);
	fish.position.setY(Mat.Thickness + fishLength * Mat.FishLift);
	const mat = new Group().add(pad, ...bolsters(length, width), fish);
	mat.traverse((part) => (part.castShadow = true));
	return mat;
}
