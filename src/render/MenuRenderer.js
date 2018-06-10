export default class MenuRenderer {

	constructor(gl, shaderHelper){
		this.gl = gl;

		this.shaderProgram = shaderHelper.getProgram();
	}
	
	render() {

	}

	releaseGL() {
		this.gl.deleteProgram(this.shaderProgram);
	}
}