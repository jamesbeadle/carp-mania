import { isClustered, type SwimCluster } from '../scene/clusterSwims';
import { BankPalette } from '../scene/palette';

const ClusterMark = { RadiusPixels: 14, LineWidthPixels: 2, FontPixels: 13, LeastScale: 0.2 } as const;

export function drawClusters(context: CanvasRenderingContext2D, clusters: SwimCluster[], pixelsPerScenePixel: number) {
	const scale = Math.max(ClusterMark.LeastScale, pixelsPerScenePixel);
	const radius = ClusterMark.RadiusPixels / scale;
	for (const cluster of clusters.filter(isClustered)) {
		context.save();
		context.fillStyle = BankPalette.Peg;
		context.strokeStyle = BankPalette.PegEdge;
		context.lineWidth = ClusterMark.LineWidthPixels / scale;
		context.beginPath();
		const { x, y } = cluster.centre;
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.fill();
		context.stroke();
		context.fillStyle = BankPalette.Label;
		context.font = `bold ${ClusterMark.FontPixels / scale}px sans-serif`;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(String(cluster.swims.length), x, y);
		context.restore();
	}
}
