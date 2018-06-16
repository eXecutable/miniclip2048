import ShaderHelper from "./shaders/ShaderHelper.js";
import GameRenderer from "../game/GameRenderer.js";
import HighScoresRenderer from "../menus/HighScoresRenderer.js";
import MainMenuRenderer from "../menus/MainMenuRenderer";

export default class RenderManager {
	
	/**
	 *Creates an instance of RenderManager.
	* @memberof RenderManager
	*/
	constructor(){
		let gl = document.getElementById("canvas").getContext("webgl2");
		if (!gl) {
			throw "Webgl2 not found.";
		}
		this.shaderHelper = Object.freeze(new ShaderHelper(gl));

		this.gameRenderer = Object.freeze(new GameRenderer(gl));
		this.highscoresRenderer = Object.freeze(new HighScoresRenderer(gl));
		this.menuRenderer = Object.freeze(new MainMenuRenderer(gl));

		this.renderers = [this.menuRenderer, this.highscoresRenderer, this.gameRenderer];
	}

	/**
	 * Are we ready to render?
	 * @returns {Boolean} True if all renderers are ready.
	 * @memberof RenderManager
	 */
	isLoaded() {
		for (let index = 0; index < this.renderers.length; index++) {
			const renderer = this.renderers[index];
			if (!renderer.isLoaded()) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Release WebGL resources of all renderers.
	 * @memberof GameRenderer
	 */
	releaseGL() {
		for (let index = 0; index < this.renderers.length; index++) {
			const renderer = this.renderers[index];
			renderer.releaseGL();
		}
		this.renderers = null;
		this.gameRenderer =  null;
		this.highscoresRenderer = null;
		this.menuRenderer = null;
	}
}