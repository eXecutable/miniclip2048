import GameRenderer from "../game/GameRenderer.js";
import HighScoresRenderer from "../menus/HighScoresRenderer.js";
import MainMenuRenderer from "../menus/MainMenuRenderer";
import TextHelper from "../render/shaders/TextHelper.js";

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
		this.helpers = {
			Text: new TextHelper(gl, this),
		};

		this.gameRenderer = new GameRenderer(gl, this);
		this.highscoresRenderer = new HighScoresRenderer(gl, this);
		this.menuRenderer = new MainMenuRenderer(gl, this);

		this.renderers = [this.menuRenderer, this.highscoresRenderer, this.gameRenderer];
		this.nextTextureUnitAvailable = 0;
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
	 * Centralized source for global helpers.
	 * @param {String} name name of the helper
	 * @memberof RenderManager
	 */
	getGlobalHelper(name) {
		return this.helpers[name];
	}

	/**
	 * Get where to place texture.
	 * @returns {Number} The number of the texture unit
	 * @memberof RenderManager
	 */
	getNextTextureUnit() {
		//TODO: evolve into texture manager
		return this.nextTextureUnitAvailable++;
	}

	/**
	 * Release WebGL resources of all renderers.
	 * @memberof GameRenderer
	 */
	releaseGL() {
		this.helpers.Text.releaseGL();
		for (let index = 0; index < this.renderers.length; index++) {
			const renderer = this.renderers[index];
			renderer.releaseGL();
		}
		this.helpers = null;
		this.renderers = null;
		this.gameRenderer =  null;
		this.highscoresRenderer = null;
		this.menuRenderer = null;
	}
}