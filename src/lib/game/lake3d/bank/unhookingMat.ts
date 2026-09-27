import { BoxGeometry, CanvasTexture, Group, Mesh, MeshStandardMaterial, SRGBColorSpace, type Object3D } from 'three';
import type { CarpStrain } from '$lib/domain/types';
import { createCarp } from '../fish/carpModel';
import { carpLengthMetres } from '../fish/carpSize';
import { swimBeat } from '../fish/swimmingMaterial';

const Mat = { Pixels: 256, Quilts: 7, Thickness: 0.07, Rim: 0.12, RimHeight: 0.16, Margin: 0.45, WidthShare: 0.62, FishLift: 0.08 } as const;
const MatLook = { Cloth: '#33603a', Stitch: 'rgba(190, 225, 175, 0.4)', Rim: '#1f3a26' } as const;
const Breathing = { Beat: 1.6, Sweep: 0.012 } as const;

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
	return texture;
}

function rims(length: number, width: number, material: MeshStandardMaterial) {
	const sides: [number, number, number, number][] = [[length, Mat.Rim, 0, (width - Mat.Rim) / 2], [length, Mat.Rim, 0, -(width - Mat.Rim) / 2], [Mat.Rim, width, (length - Mat.Rim) / 2, 0], [Mat.Rim, width, -(length - Mat.Rim) / 2, 0]];
	return sides.map(([along, across, x, z]) => {
		const rim = new Mesh(new BoxGeometry(along, Mat.RimHeight, across), material);
		rim.position.set(x, Mat.RimHeight / 2, z);
		return rim;
	});
}

export function createMatWithFish(strain: CarpStrain, weightLb: number): Object3D {
	const fishLength = carpLengthMetres(weightLb);
	const length = fishLength + Mat.Margin;
	const width = Math.max(0.6, length * Mat.WidthShare);
	const pad = new Mesh(new BoxGeometry(length, Mat.Thickness, width), new MeshStandardMaterial({ map: quiltTexture(), roughness: 0.95 }));
	pad.position.setY(Mat.Thickness / 2);
	pad.receiveShadow = true;
	const fish = createCarp(strain, swimBeat(Breathing.Beat, Breathing.Sweep));
	fish.scale.setScalar(fishLength);
	fish.rotation.set(0, Math.PI / 2, Math.PI / 2);
	fish.position.setY(Mat.Thickness + fishLength * Mat.FishLift);
	return new Group().add(pad, ...rims(length, width, new MeshStandardMaterial({ color: MatLook.Rim, roughness: 0.9 })), fish);
}
