import ShaderHelper from "./shaders/ShaderHelper.js";
import GameRenderer from "./GameRenderer.js";
import HighScoresRenderer from "./HighScoresRenderer.js";
import MenuRenderer from "./MenuRenderer.js";

export default class RenderManager {

	constructor(){
		let gl = document.getElementById("canvas").getContext("webgl2");
		if (!gl) {
			throw "Webgl2 not found.";
		}
		this.gl = gl;

		this.shaderHelper = new ShaderHelper(gl);
		this.gameRenderer = new GameRenderer(gl, this.shaderHelper);
		this.highscoresRenderer = new HighScoresRenderer(gl, this.shaderHelper);
		this.menuRenderer = new MenuRenderer(gl, this.shaderHelper);
	}
	
	isLoaded() {
		return this.menuRenderer.isLoaded();
		//TODO: && this.highscoresRenderer.isLoaded()
		//&& this.gameRenderer.isLoaded()
		//&& this.shaderHelper.isLoaded();
	}

	releaseGL() {
		if (this.gameRenderer) {
			this.gameRenderer.releaseGL();
			this.gameRenderer = null;
		}

		if (this.highscoresRenderer) {
			this.highscoresRenderer.releaseGL();
			this.highscoresRenderer = null;
		}

		if (this.menuRenderer) {
			this.menuRenderer.releaseGL();
			this.menuRenderer = null;
		}
	}
}