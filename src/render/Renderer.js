
/**
 * Abstract class of a Renderer used by RenderManager
 * @export
 * @class Renderer
 */
export default class Renderer {
	/**
	 *Creates an instance of Renderer.
	 * @param {WebGLRenderingContext} gl
	 * @memberof Renderer
	 */
	constructor(gl){	
		this.gl = gl;
		this.animationFrameRequestID = null;
	}

	/**
	 * Query if the renderer is ready to render.
	 * @return {Boolean} true if it's ready to render
	 * @memberof Renderer
	 */
	isLoaded() {
		throw "Not implemented";
	}

	/**
	 * Stop render loop
	 * @memberof Renderer
	 */
	stop() {
		window.cancelAnimationFrame(this.animationFrameRequestID);
		this.animationFrameRequestID = null;
	}

	/**
	 * Draw to screen.
	 * @memberof Renderer
	 */
	render() {
		throw "Not implemented";
	}

	/**
	 * Release any GL resources. Object becomes invalid to render.
	 * @memberof Renderer
	 */
	releaseGL() {
		throw "Not implemented";
	}
}