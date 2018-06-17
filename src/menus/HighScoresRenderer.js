import Renderer from "../render/Renderer.js";

export default class HighScoresRenderer extends Renderer {

	constructor(gl){
		super(gl);

		this.boundRenderFunction = this.render.bind(this);
	}

	isLoaded() {
		return true;
	}
	
	update() {
		this.animationFrameRequestID = window.requestAnimationFrame(this.boundRenderFunction);
	}

	render() {
		let gl = this.gl;

		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clearColor(0.5, 0.8, 0.4, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof HighScoresRenderer
	 */
	releaseGL() {
		
	}
}