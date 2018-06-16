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

	releaseGL() {
		
	}
}