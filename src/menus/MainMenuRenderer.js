import backgroundImage from "2048MenuBackground.png";
import Renderer from "../render/Renderer.js";
import SquareTextureHelper from "../render/shaders/SquareTextureHelper.js";

export default class MainMenuRenderer extends Renderer {
	/**
	 *Creates an instance of MainMenuRenderer.
	* @param {WebGLRenderingContext} gl
	* @param {RenderManager} renderManager
	* @memberof MainMenuRenderer
	*/
	constructor(gl, renderManager){
		super(gl);

		this.textHelper = renderManager.getGlobalHelper("Text");
		this.textHelper.init("game");
		this.textHelper.init("game selected");
		this.textHelper.init("highscores");
		this.textHelper.init("highscores selected");
		this.textHelper.init("exit");
		this.textHelper.init("exit selected");

		this.backgroundShader = new SquareTextureHelper(gl, renderManager, backgroundImage);

		this.boundRenderFunction = this.render.bind(this);
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
	update(buttonIndex) {
		this.buttonIndex = buttonIndex;
		this.animationFrameRequestID = window.requestAnimationFrame(this.boundRenderFunction);
	}

	/**
	 * Draw menu on the canvas
	 * @param {Number} msTime
	 * @memberof MainMenuRenderer
	 */
	render(){
		this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

		this.backgroundShader.render(0,0);

		switch(this.buttonIndex) {
		case 0:
			this.textHelper.render(100, 200, "game selected");
			this.textHelper.render(100, 250, "highscores");
			this.textHelper.render(100, 300, "exit");
			break;
		case 1:
			this.textHelper.render(100, 200, "game");
			this.textHelper.render(100, 250, "highscores selected");
			this.textHelper.render(100, 300, "exit");
			break;
		case 2:
			this.textHelper.render(100, 200, "game");
			this.textHelper.render(100, 250, "highscores");
			this.textHelper.render(100, 300, "exit selected");
			break;
		}
	}

	/**
	 * Release WebGL resources used. Invalidates object, should be called before unreferencing.
	 * @memberof MainMenuRenderer
	 */
	releaseGL() {
		this.backgroundShader.releaseGL();
	}
}