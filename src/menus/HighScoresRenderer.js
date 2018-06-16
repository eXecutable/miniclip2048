import Renderer from "../render/Renderer.js";

export default class HighScoresRenderer extends Renderer {

	constructor(gl){
		super(gl);
	}

	isLoaded() {
		return true;
	}
	
	render() {

	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof HighScoresRenderer
	 */
	releaseGL() {
		
	}
}