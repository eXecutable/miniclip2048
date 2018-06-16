import backgroundImage from "2048MenuBackground.png";
import Renderer from "../render/Renderer.js";
import TextHelper from "../render/shaders/TextHelper.js";
import SquareTextureHelper from "../render/shaders/SquareTextureHelper.js";

export default class MainMenuRenderer extends Renderer {
	/**
	 *Creates an instance of MainMenuRenderer.
	* @param {WebGLRenderingContext} gl
	* @memberof MainMenuRenderer
	*/
	constructor(gl){
		super(gl);

		this.textHelper = new TextHelper(gl);
		this.textHelper.init("game");
		this.textHelper.init("highscores");

		this.backgroundShader = new SquareTextureHelper(gl, backgroundImage);
	}
	
	/**
	 * Query if the renderer is ready to render.
	 * @return {Boolean} true if it's ready to render
	 * @memberof MainMenuRenderer
	 */
	isLoaded() {
		return this.textHelper.isLoaded() && this.backgroundShader.isLoaded();
	}

	/**
	 * Draw main menu
	 * @param {Number} buttonIndex
	 * @memberof MainMenuRenderer
	 */
	render(buttonIndex) {

		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

		this.backgroundShader.render(0,0);

		if(buttonIndex === 0) {
			this.textHelper.render(100, 200, "game selected");
			this.textHelper.render(100, 300, "highscores");
		} else {
			this.textHelper.render(100, 200, "game");
			this.textHelper.render(100, 300, "highscores selected");
		}
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof MainMenuRenderer
	 */
	releaseGL() {
		this.textHelper.releaseGL();
		this.backgroundShader.releaseGL();
	}
}