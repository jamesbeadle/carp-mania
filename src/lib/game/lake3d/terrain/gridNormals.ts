const Up = [0, 1, 0];
const Flattest = 1e-12;

function difference(positions: Float32Array, from: number, to: number) {
	return [positions[to * 3] - positions[from * 3], positions[to * 3 + 1] - positions[from * 3 + 1], positions[to * 3 + 2] - positions[from * 3 + 2]];
}

function upwardCross(first: number[], second: number[]) {
	const [ax, ay, az] = first;
	const [bx, by, bz] = second;
	const normal = [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
	const length = Math.hypot(normal[0], normal[1], normal[2]);
	if (length < Flattest) return Up;
	const facing = normal[1] < 0 ? -length : length;
	return normal.map((part) => part / facing);
}

export function normalsAcrossGrid(positions: Float32Array, rowCount: number) {
	const vertexCount = positions.length / 3;
	const stationCount = vertexCount / rowCount;
	const normals = new Float32Array(positions.length);
	for (let station = 0; station < stationCount; station++) {
		const before = ((station + stationCount - 1) % stationCount) * rowCount;
		const after = ((station + 1) % stationCount) * rowCount;
		for (let row = 0; row < rowCount; row++) {
			const vertex = station * rowCount + row;
			const along = difference(positions, before + row, after + row);
			const across = difference(positions, station * rowCount + Math.max(0, row - 1), station * rowCount + Math.min(rowCount - 1, row + 1));
			normals.set(upwardCross(across, along), vertex * 3);
		}
	}
	return normals;
}
