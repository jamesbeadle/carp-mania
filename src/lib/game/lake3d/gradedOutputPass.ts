import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GradeFunction, gradeUniforms } from './gradeShaders';

const MainStart = 'void main() {';
const GradeCall = '\tgl_FragColor.rgb = graded(gl_FragColor.rgb, vUv);\n}';

function gradedFragment(source: string) {
	const declared = source.replace(MainStart, `${GradeFunction}\n${MainStart}`);
	const end = declared.lastIndexOf('}');
	return `${declared.slice(0, end)}${GradeCall}`;
}

export class GradedOutputPass extends OutputPass {
	constructor() {
		super();
		Object.assign(this.uniforms, gradeUniforms());
		const { material } = this;
		material.fragmentShader = gradedFragment(material.fragmentShader);
	}
}
